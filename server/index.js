const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB Connection Error:', err));

app.use(cors());
app.use(helmet());
app.use(express.json());

// Middleware: Authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Security Check helper for MQL queries
const isSafeQuery = (query, type) => {
    if (!query) return true;
    const queryStr = JSON.stringify(query).toLowerCase();

    // Prevent execution of modifications or output redirection
    const forbidden = ['$out', '$merge', '$eval', '$accumulator', '$function'];
    for (const op of forbidden) {
        if (queryStr.includes(op)) {
            return false;
        }
    }

    if (type === 'aggregation' && Array.isArray(query)) {
        for (const stage of query) {
            const keys = Object.keys(stage);
            if (keys.some(k => k === '$out' || k === '$merge')) {
                return false;
            }
        }
    }
    return true;
};

// Routes: Auth
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await mongoose.connection.db.collection('users').findOne({ email });
        if (!user) return res.status(401).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    try {
        const db = mongoose.connection.db;
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email,
            password_hash,
            role: 'user',
            created_at: new Date()
        };
        const result = await db.collection('users').insertOne(newUser);
        const token = jwt.sign({ id: result.insertedId, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ token, user: { id: result.insertedId, name: newUser.name, role: newUser.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes: Chats
app.get('/api/chats', authenticateToken, async (req, res) => {
    const { search } = req.query;
    try {
        const db = mongoose.connection.db;
        let query = { user_id: req.user.id };

        if (search) {
            // Find messages matching search term
            const matchingMessages = await db.collection('messages')
                .find({ content: { $regex: search, $options: 'i' } })
                .project({ chat_id: 1 })
                .toArray();
            const chatIds = matchingMessages.map(m => m.chat_id);

            const objectChatIds = chatIds.map(id => {
                try { return new mongoose.Types.ObjectId(id); } catch (e) { return null; }
            }).filter(Boolean);
            const stringChatIds = chatIds.map(id => id.toString());

            query = {
                user_id: req.user.id,
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { _id: { $in: objectChatIds } },
                    { id: { $in: stringChatIds } }
                ]
            };
        }

        const chats = await db.collection('chats')
            .find(query)
            .sort({ updated_at: -1 })
            .toArray();
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chats', authenticateToken, async (req, res) => {
    const { title } = req.body;
    try {
        const chat = {
            user_id: req.user.id,
            title: title || 'New Chat',
            created_at: new Date(),
            updated_at: new Date()
        };
        const result = await mongoose.connection.db.collection('chats').insertOne(chat);
        res.status(201).json({ ...chat, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/chats/:id/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await mongoose.connection.db.collection('messages')
            .find({ chat_id: req.params.id })
            .sort({ created_at: 1 })
            .toArray();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/chats/:id', authenticateToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        // Delete chat
        await db.collection('chats').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id), user_id: req.user.id });
        // Delete messages
        await db.collection('messages').deleteMany({ chat_id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route: Import CSV to MongoDB
app.post('/api/import-csv', authenticateToken, async (req, res) => {
    const { collectionName, rows } = req.body;

    if (!collectionName || !rows || !Array.isArray(rows)) {
        return res.status(400).json({ error: 'Missing collectionName or rows' });
    }

    try {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection is not established.');
        }

        // Insert rows into target collection
        const result = await db.collection(collectionName).insertMany(rows);
        res.json({ success: true, count: result.insertedCount });
    } catch (err) {
        console.error('Import Error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to import CSV data' });
    }
});

// Route: Natural Language Query (MongoDB)
app.post('/api/query', authenticateToken, async (req, res) => {
    const { query, chat_id, csvFile, imageFile, audioFile, model_name } = req.body;

    try {
        // 1. Get MongoDB Query from AI service, forwarding attachments and model selection
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/generate`, {
            query: query || '',
            csv_data: csvFile,
            image_data: imageFile,
            audio_data: audioFile,
            model_name: model_name || 'gemini-2.5-flash-lite'
        });
        // AI service wraps its response in { input: {...}, output: {...} }
        const aiOutput = aiResponse.data.output || aiResponse.data;
        const { query: mql, collection, type, explanation, detected_language, followup_suggestions, sql_query, schema_links } = aiOutput;

        // 2. Execute on MongoDB Atlas only if AI succeeded and returned an MQL query
        let results = [];
        const db = mongoose.connection.db;

        if (!db) {
            throw new Error('Database connection is not established. Please check your MongoDB Atlas connection.');
        }

        if (mql) {
            const targetCollection = collection || 'students';

            // Security check
            if (!isSafeQuery(mql, type)) {
                return res.status(400).json({ error: 'Security Exception: Unauthorized database operation requested (write/export commands are blocked).' });
            }

            try {
                const isAggregation = type === 'aggregation' || Array.isArray(mql);
                if (isAggregation) {
                    results = await db.collection(targetCollection).aggregate(mql).toArray();
                } else {
                    results = await db.collection(targetCollection).find(mql).limit(50).toArray();
                }
            } catch (dbErr) {
                console.error('MQL Execution failed:', dbErr.message);
                return res.status(400).json({
                    error: `Database execution error: ${dbErr.message}`,
                    explanation: `I generated a query but it failed to run: ${dbErr.message}. Here is the explanation of the intended search: ${explanation}`,
                    generated_query: mql,
                    sql_query,
                    schema_links
                });
            }
        } else {
            console.warn('AI failed to generate a query, skipping DB execution');
        }

        // 3. Save message to history
        const assistantMsg = {
            chat_id: chat_id,
            role: 'assistant',
            content: explanation,
            generated_query: mql,
            sql_query: sql_query || '',
            schema_links: schema_links || [],
            results: results,
            created_at: new Date()
        };
        await db.collection('messages').insertOne(assistantMsg);

        res.json({ ...assistantMsg, detected_language, followup_suggestions });

    } catch (err) {
        console.error('Query Error:', err.message);
        // Forward quota/rate-limit errors with proper status code and message
        const aiStatus = err.response?.status;
        const aiDetail = err.response?.data?.detail;
        if (aiStatus === 429 || (aiDetail && aiDetail.includes('quota'))) {
            return res.status(429).json({ error: aiDetail || 'API quota exhausted. Please try again later or contact the admin to update the API key.' });
        }
        const errorMsg = aiDetail || err.response?.data?.explanation || err.message || 'Failed to process query';
        res.status(500).json({ error: errorMsg });
    }
});

// Route: Get Database Metadata Schema
app.get('/api/schema', authenticateToken, async (req, res) => {
    try {
        const schema = {
            university: ['name', 'location', 'established', 'contact', 'website'],
            colleges: ['name', 'code', 'dean'],
            students: ['roll_no', 'name', 'department', 'year', 'semester', 'cgpa', 'status', 'gender', 'email', 'academic_status', 'is_lateral_entry'],
            faculty: ['name', 'department', 'designation', 'experience_yrs', 'email'],
            bus: ['route_no', 'driver', 'contact', 'route', 'timing'],
            mess: ['day', 'breakfast', 'lunch', 'dinner'],
            hostel: ['name', 'type', 'capacity', 'warden', 'fee_per_sem'],
            admissions: ['course', 'intake', 'last_date', 'eligibility', 'fee_annual', 'duration_years', 'lateral_entry_available'],
            placements: ['student_roll', 'company', 'package_lpa', 'role', 'status'],
            marks: ['student_roll', 'subject_code', 'subject_name', 'exam_type', 'marks_obtained', 'max_marks', 'grade', 'semester']
        };
        res.json(schema);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route: Get History of uploads (CSV, Image, Audio)
app.get('/api/uploads-history', authenticateToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const userChats = await db.collection('chats').find({ user_id: req.user.id }).toArray();
        const chatIds = userChats.map(c => c._id.toString()).concat(userChats.map(c => c.id).filter(Boolean));

        const messages = await db.collection('messages')
            .find({
                chat_id: { $in: chatIds },
                $or: [
                    { csvFile: { $exists: true, $ne: null } },
                    { imageFile: { $exists: true, $ne: null } },
                    { audioFile: { $exists: true, $ne: null } }
                ]
            })
            .sort({ created_at: -1 })
            .toArray();

        const history = [];
        messages.forEach(msg => {
            const chat = userChats.find(c => (c._id.toString() === msg.chat_id || c.id === msg.chat_id));
            const chatTitle = chat ? chat.title : 'Unknown Conversation';

            if (msg.csvFile) {
                history.push({
                    type: 'csv',
                    name: msg.csvFile.name,
                    timestamp: msg.created_at || new Date(),
                    chatId: msg.chat_id,
                    chatTitle: chatTitle,
                    details: `${msg.csvFile.rows?.length || 0} rows, ${msg.csvFile.headers?.length || 0} fields`
                });
            }
            if (msg.imageFile) {
                history.push({
                    type: 'image',
                    name: msg.imageFile.name || 'Image Upload',
                    timestamp: msg.created_at || new Date(),
                    chatId: msg.chat_id,
                    chatTitle: chatTitle,
                    previewUrl: msg.imageFile.previewUrl || `data:${msg.imageFile.mimeType};base64,${msg.imageFile.base64}`
                });
            }
            if (msg.audioFile) {
                history.push({
                    type: 'audio',
                    name: msg.audioFile.name || 'Voice message',
                    timestamp: msg.created_at || new Date(),
                    chatId: msg.chat_id,
                    chatTitle: chatTitle,
                    previewUrl: msg.audioFile.previewUrl || `data:${msg.audioFile.mimeType};base64,${msg.audioFile.base64}`
                });
            }
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route: Save a query (Bookmark)
app.post('/api/saved-queries', authenticateToken, async (req, res) => {
    const { title, queryText, mqlQuery, collectionName, type } = req.body;
    try {
        const db = mongoose.connection.db;
        const savedQuery = {
            user_id: req.user.id,
            title,
            queryText,
            mqlQuery,
            collectionName: collectionName || 'students',
            type: type || 'find',
            created_at: new Date()
        };
        const result = await db.collection('saved_queries').insertOne(savedQuery);
        res.status(201).json({ ...savedQuery, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route: Get all saved queries (Bookmarks)
app.get('/api/saved-queries', authenticateToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const saved = await db.collection('saved_queries')
            .find({ user_id: req.user.id })
            .sort({ created_at: -1 })
            .toArray();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route: Delete a saved query (Bookmark)
app.delete('/api/saved-queries/:id', authenticateToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        await db.collection('saved_queries').deleteOne({
            _id: new mongoose.Types.ObjectId(req.params.id),
            user_id: req.user.id
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route: Run direct MQL query (from Saved Queries)
app.post('/api/run-query', authenticateToken, async (req, res) => {
    const { collectionName, mqlQuery, type } = req.body;
    if (!collectionName || !mqlQuery) {
        return res.status(400).json({ error: 'Missing collectionName or query' });
    }
    try {
        const db = mongoose.connection.db;
        let results = [];
        const isAggregation = type === 'aggregation' || Array.isArray(mqlQuery);
        if (isAggregation) {
            results = await db.collection(collectionName).aggregate(mqlQuery).toArray();
        } else {
            results = await db.collection(collectionName).find(mqlQuery).limit(50).toArray();
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route: Delete all chats and messages (Clear data in Settings)
app.delete('/api/chats', authenticateToken, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const userChats = await db.collection('chats').find({ user_id: req.user.id }).toArray();
        const chatIds = userChats.map(c => c._id.toString()).concat(userChats.map(c => c.id).filter(Boolean));

        await db.collection('chats').deleteMany({ user_id: req.user.id });
        await db.collection('messages').deleteMany({ chat_id: { $in: chatIds } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: 'mongodb_atlas' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

