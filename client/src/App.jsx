import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Mock login for demo
    const login = async () => {
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: 'admin@university.edu',
          password: 'Admin@123'
        });
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        fetchChats(res.data.token);
      } catch (err) {
        console.error('Login failed', err);
      }
    };
    login();
  }, []);

  const fetchChats = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(res.data);
    } catch (err) {
      console.error('Fetch chats failed', err);
    }
  };

  const startNewChat = () => {
    const id = uuidv4();
    const newChat = { id, title: 'New Chat' };
    setChats([newChat, ...chats]);
    setCurrentChatId(id);
    setMessages([]);
    
    // Save to DB
    const token = localStorage.getItem('token');
    axios.post(`${API_BASE}/chats`, newChat, {
      headers: { Authorization: `Bearer ${token}` }
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

  const handleSendMessage = async (text) => {
    if (!currentChatId) {
      // Auto start new chat if none selected
      const id = uuidv4();
      const newChat = { id, title: text.substring(0, 30) + '...' };
      setChats([newChat, ...chats]);
      setCurrentChatId(id);
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/chats`, newChat, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/query`, {
        query: text,
        chat_id: currentChatId || chats[0]?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.content,
        generated_query: res.data.generated_query,
        results: res.data.results,
        detected_language: res.data.detected_language
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

  return (
    <div className="flex h-screen bg-background text-foreground dark overflow-hidden">
      <Sidebar 
        chats={chats} 
        currentChatId={currentChatId} 
        onNewChat={startNewChat} 
        onSelectChat={selectChat}
        user={user}
      />
      <main className="flex-1 flex flex-col relative">
        <ChatWindow 
          messages={messages} 
          loading={loading} 
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
}

export default App;
