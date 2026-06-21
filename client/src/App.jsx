import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import { DashboardView, UploadsHistoryView, SavedQueriesView, SettingsView, SchemaView } from './components/SidebarViews';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Sidebar navigation
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [injectedQuery, setInjectedQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        fetchChats(token, '');
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLoginSuccess = (token, loggedInUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    fetchChats(token, '');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setChats([]);
    setMessages([]);
    setCurrentChatId(null);
  };

  // Fetch chats – with optional search term
  const fetchChats = async (token, search = '') => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await axios.get(`${API_BASE}/chats${params}`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      setChats(res.data);
    } catch (err) {
      console.error('Fetch chats failed', err);
    }
  };

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChats(null, searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const startNewChat = () => {
    const id = uuidv4();
    const newChat = { id, title: 'New Conversation' };
    setChats([newChat, ...chats]);
    setCurrentChatId(id);
    setMessages([]);

    const token = localStorage.getItem('token');
    axios.post(`${API_BASE}/chats`, newChat, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setChats(prev => prev.map(c => c.id === id ? res.data : c));
      setCurrentChatId(res.data._id);
    });
  };

  const selectChat = async (id) => {
    setCurrentChatId(id);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_BASE}/chats/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Fetch messages failed', err);
    }
  };

  const deleteChat = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/chats/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(prev => prev.filter(c => (c._id || c.id) !== id));
      if (currentChatId === id) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Delete chat failed', err);
    }
  };

  const handleSendMessage = async (text, attachments = {}) => {
    let chatIdForQuery = currentChatId;
    if (!currentChatId) {
      const id = uuidv4();
      const defaultTitle = text.trim()
        ? text.substring(0, 30) + '...'
        : (attachments.csvFile?.name || attachments.imageFile?.name || attachments.audioFile?.name || 'Attachment Chat');
      const newChat = { id, title: defaultTitle };
      setChats([newChat, ...chats]);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/chats`, newChat, {
        headers: { Authorization: `Bearer ${token}` }
      });
      chatIdForQuery = res.data._id;
      setChats(prev => [res.data, ...prev.filter(c => c.id !== id)]);
      setCurrentChatId(chatIdForQuery);
    }

    const userMsg = {
      role: 'user',
      content: text,
      csvFile: attachments.csvFile,
      imageFile: attachments.imageFile,
      audioFile: attachments.audioFile
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Get selected model from localStorage (set via Settings)
    const selectedModel = localStorage.getItem('selectedModel') || 'gemini-2.5-flash-lite';

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/query`, {
        query: text,
        chat_id: chatIdForQuery,
        csvFile: attachments.csvFile,
        imageFile: attachments.imageFile ? { mimeType: attachments.imageFile.mimeType, base64: attachments.imageFile.base64 } : null,
        audioFile: attachments.audioFile ? { mimeType: attachments.audioFile.mimeType, base64: attachments.audioFile.base64 } : null,
        model_name: selectedModel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.content,
        generated_query: res.data.generated_query,
        results: res.data.results,
        detected_language: res.data.detected_language,
        sql_query: res.data.sql_query,
        schema_links: res.data.schema_links,
        followup_suggestions: res.data.followup_suggestions,
        collection: res.data.collection
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: ' + (err.response?.data?.error || 'Server error'),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Inject query text into the chat input (from Saved Queries)
  const handleInjectQuery = useCallback((queryText) => {
    setInjectedQuery(queryText);
    setActiveTab('chat');
  }, []);

  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onSelectChat={selectChat} />;
      case 'history':
        return <UploadsHistoryView onSelectChat={selectChat} onTabChange={setActiveTab} />;
      case 'saved':
        return (
          <SavedQueriesView
            onSelectChat={selectChat}
            onTabChange={setActiveTab}
            onInjectQuery={handleInjectQuery}
          />
        );
      case 'settings':
        return <SettingsView />;
      case 'schema':
        return <SchemaView />;
      case 'chat':
      default:
        return (
          <ChatWindow
            messages={messages}
            loading={loading}
            onSendMessage={handleSendMessage}
            injectedQuery={injectedQuery}
            onInjectedQueryConsumed={() => setInjectedQuery('')}
          />
        );
    }
  };

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Global Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="glow-blob top-[-10%] right-[-10%] opacity-30"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="glow-blob bottom-[-15%] left-[-5%] opacity-20 bg-emerald-soft/30 blur-[100px]"
        />
      </div>

      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Navbar user={user} onLogout={handleLogout} />
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {renderMainContent()}
        </motion.div>
      </main>
    </div>
  );
}

export default App;
