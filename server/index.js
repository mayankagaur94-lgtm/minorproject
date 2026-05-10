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

// Routes: Chats
app.get('/api/chats', authenticateToken, async (req, res) => {
    try {
        const chats = await mongoose.connection.db.collection('chats')
            .find({ user_id: req.user.id })
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
        res.status(201).json({ _id: result.insertedId, ...chat });
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

// Route: Natural Language Query (MongoDB)
app.post('/api/query', authenticateToken, async (req, res) => {
    const { query, chat_id } = req.body;

    try {
        // 1. Get MongoDB Query from AI service
        // Note: The AI service endpoint name might be /generate or /generate-mql
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/generate`, { query });
        const { query: mql, type, explanation, detected_language, followup_suggestions } = aiResponse.data;

        // 2. Execute on MongoDB Atlas
        let results = [];
        const db = mongoose.connection.db;
        if (type === 'aggregation') {
            results = await db.collection('students').aggregate(mql).toArray();
        } else {
            results = await db.collection('students').find(mql).limit(50).toArray();
        }

        // 3. Save message to history
        const assistantMsg = {
            chat_id: chat_id,
            role: 'assistant',
            content: explanation,
            generated_query: mql,
            results: results,
            created_at: new Date()
        };
        await db.collection('messages').insertOne(assistantMsg);

        res.json({ ...assistantMsg, detected_language, followup_suggestions });

    } catch (err) {
        console.error('Query Error:', err.message);
        res.status(500).json({ error: err.response?.data?.detail || 'Failed to process query' });
    }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'mongodb_atlas' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
