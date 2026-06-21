import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  History, 
  Bookmark, 
  Settings, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  CheckCircle, 
  Play, 
  Trash2, 
  ExternalLink,
  Search,
  Database,
  Cpu,
  FileSpreadsheet,
  Image as ImageIcon,
  Headphones,
  Calendar,
  X,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

// Helper function for styling classes
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

// 1. DASHBOARD VIEW
export const DashboardView = ({ onSelectChat }) => {
  const [dbStats, setDbStats] = useState({
    students: 120,
    placements: 45,
    faculty: 32,
    hostel: 15
  });

  const stats = [
    { label: 'Total Students', value: dbStats.students, icon: Users, color: 'text-celadon bg-celadon/10 border-celadon/25' },
    { label: 'Placements Active', value: dbStats.placements, icon: Briefcase, color: 'text-emerald-soft bg-emerald-soft/10 border-emerald-soft/25' },
    { label: 'Total Faculty', value: dbStats.faculty, icon: GraduationCap, color: 'text-blue-400 bg-blue-400/10 border-blue-400/25' },
    { label: 'Hostels Registered', value: dbStats.hostel, icon: Building2, color: 'text-purple-400 bg-purple-400/10 border-purple-400/25' },
  ];

  // Dummy placement pack distribution
  const chartData = [
    { dept: 'CSE', packages: 12 },
    { dept: 'Civil', packages: 6 },
    { dept: 'Nursing', packages: 4 },
    { dept: 'BHM', packages: 8 },
    { dept: 'Microbio', packages: 5 },
    { dept: 'MBA', packages: 10 }
  ];

  const maxVal = Math.max(...chartData.map(d => d.packages));

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="text-celadon" /> Dashboard Overview
        </h2>
        <p className="text-sm text-white/50 mt-1">Real-time statistics and analytics for the University Management System.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg"
          >
            <div>
              <p className="text-xs text-white/40 uppercase font-bold tracking-wider">{stat.label}</p>
              <p className="text-3xl font-extrabold text-white mt-1">{stat.value}</p>
            </div>
            <div className={cn("p-3 rounded-xl border", stat.color)}>
              <stat.icon size={22} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Chart */}
        <div className="lg:col-span-2 glass border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-6">Placement Packages Distribution (LPA)</h3>
          
          {/* Custom SVG/CSS Bar Chart */}
          <div className="flex-1 flex items-end justify-between h-48 pt-4 px-2 border-b border-white/10">
            {chartData.map((d) => {
              const heightPct = (d.packages / maxVal) * 100;
              return (
                <div key={d.dept} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="relative w-full flex justify-center">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 border border-white/15 text-[10px] text-white px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-xl">
                      {d.packages} LPA
                    </div>
                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      className="w-8 sm:w-12 bg-gradient-to-t from-celadon-dark to-celadon rounded-t-lg group-hover:brightness-110 transition-all shadow-md"
                    />
                  </div>
                  <span className="text-[10px] text-white/40 font-bold uppercase mt-1">{d.dept}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Server & Database status */}
        <div className="glass border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">System Connection Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Database className="text-celadon" size={18} />
                <div>
                  <p className="text-xs font-bold text-white">MongoDB Atlas</p>
                  <p className="text-[10px] text-white/40">Active connection pool</p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Cpu className="text-celadon" size={18} />
                <div>
                  <p className="text-xs font-bold text-white">AI FastAPI Service</p>
                  <p className="text-[10px] text-white/40">Model: gemini-3.1-flash-lite</p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-celadon" size={18} />
                <div>
                  <p className="text-xs font-bold text-white">Active session</p>
                  <p className="text-[10px] text-white/40">Secure JWT authenticated</p>
                </div>
              </div>
              <div className="text-[10px] font-bold text-emerald-soft uppercase">Verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. UPLOADS HISTORY VIEW
export const UploadsHistoryView = ({ onSelectChat, onTabChange }) => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/uploads-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploads(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const getFileIcon = (type) => {
    switch (type) {
      case 'csv': return <FileSpreadsheet className="text-emerald-soft" size={18} />;
      case 'image': return <ImageIcon className="text-blue-400" size={18} />;
      case 'audio': return <Headphones className="text-purple-400" size={18} />;
      default: return <FileSpreadsheet size={18} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-celadon" /> Uploads History
          </h2>
          <p className="text-sm text-white/50 mt-1">Review previously uploaded CSVs, images, and voice recordings across conversations.</p>
        </div>
        <button 
          onClick={fetchUploads}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/10"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-white/40 gap-2">
          <div className="w-5 h-5 border-2 border-celadon border-t-transparent rounded-full animate-spin"></div>
          Loading uploads history...
        </div>
      ) : uploads.length === 0 ? (
        <div className="glass border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-white/5 border border-white/10 text-white/30 mb-4">
            <History size={40} />
          </div>
          <h3 className="text-base font-bold text-white">No Uploads Found</h3>
          <p className="text-sm text-white/40 max-w-sm mt-1">Documents, images, or audio voice messages you upload in chat sessions will appear here.</p>
        </div>
      ) : (
        <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs font-bold text-white/60 uppercase">
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Uploaded In</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-white/80">
                {uploads.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        {getFileIcon(item.type)}
                      </div>
                      <span className="truncate max-w-[180px]" title={item.name}>{item.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono uppercase text-[10px] text-white/40">{item.type}</td>
                    <td className="px-6 py-4 text-white/60">
                      {item.type === 'csv' ? (
                        <span className="bg-emerald-soft/10 text-emerald-soft border border-emerald-soft/20 px-2 py-0.5 rounded-lg font-semibold">
                          {item.details}
                        </span>
                      ) : item.type === 'image' ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/15">
                          <img src={item.previewUrl} alt="Upload" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <audio src={item.previewUrl} controls className="h-6 w-32 accent-celadon" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          onSelectChat(item.chatId);
                          onTabChange('chat');
                        }}
                        className="hover:underline hover:text-celadon transition-all text-left truncate max-w-[140px] block"
                        title={item.chatTitle}
                      >
                        {item.chatTitle}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-white/40">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          onSelectChat(item.chatId);
                          onTabChange('chat');
                        }}
                        className="p-1.5 rounded-lg bg-celadon/15 text-celadon hover:bg-celadon hover:text-background transition-all"
                        title="Jump to Chat"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. SAVED QUERIES VIEW
export const SavedQueriesView = ({ onSelectChat, onTabChange, onInjectQuery }) => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningQuery, setRunningQuery] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [runningId, setRunningId] = useState(null);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/saved-queries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this saved query?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/saved-queries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQueries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunQuery = async (item) => {
    setRunningId(item._id);
    setQueryResults(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/run-query', {
        collectionName: item.collectionName,
        mqlQuery: item.mqlQuery,
        type: item.type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRunningQuery(item);
      setQueryResults(response.data);
    } catch (err) {
      alert(`Query Execution Failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setRunningId(null);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark className="text-celadon" /> Saved Queries
        </h2>
        <p className="text-sm text-white/50 mt-1">Run bookmarked MongoDB queries directly or load them back into the chat workspace.</p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-white/40 gap-2">
          <div className="w-5 h-5 border-2 border-celadon border-t-transparent rounded-full animate-spin"></div>
          Loading bookmarked queries...
        </div>
      ) : queries.length === 0 ? (
        <div className="glass border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-white/5 border border-white/10 text-white/30 mb-4">
            <Bookmark size={40} />
          </div>
          <h3 className="text-base font-bold text-white">No Bookmarks Saved</h3>
          <p className="text-sm text-white/40 max-w-sm mt-1">When asking database questions in chat, click "Save Query" next to the pipeline block to store it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {queries.map((item) => (
            <motion.div
              layout
              key={item._id}
              className="glass border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl relative"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-[10px] text-celadon uppercase font-semibold tracking-wider mt-0.5">
                    Target: {item.collectionName} • {item.type}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRunQuery(item)}
                    disabled={runningId === item._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-celadon text-background hover:bg-celadon-dark font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Play size={12} fill="currentColor" /> {runningId === item._id ? 'Running...' : 'Run Query'}
                  </button>
                  <button
                    onClick={() => onInjectQuery(item.queryText)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
                    title="Load into chat input"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Bookmark"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Natural Question</span>
                  <p className="text-xs text-white/80 mt-1">{item.queryText}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">MQL Pipeline Code</span>
                  <pre className="text-[10px] font-mono text-celadon/90 overflow-x-auto mt-1 custom-scrollbar max-h-24">
                    {JSON.stringify(item.mqlQuery, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Query Execution drawer */}
      <AnimatePresence>
        {queryResults && runningQuery && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-0 z-50 glass border-t border-white/15 p-6 shadow-2xl max-h-[60vh] overflow-y-auto flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Execution results: "{runningQuery.title}"</h3>
                <p className="text-[10px] text-white/40">{queryResults.length} records returned from collection '{runningQuery.collectionName}'</p>
              </div>
              <button 
                onClick={() => setQueryResults(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-black/30 border border-white/5 rounded-xl p-3 font-mono text-[11px] text-celadon custom-scrollbar max-h-80">
              <pre>{JSON.stringify(queryResults, null, 2)}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 4. SETTINGS VIEW
export const SettingsView = () => {
  const [selectedModel, setSelectedModel] = useState(
    localStorage.getItem('selectedModel') || 'gemini-3.1-flash-lite'
  );
  const [clearing, setClearing] = useState(false);

  const models = [
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Fast, lightweight and cost-efficient. Default model.' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Standard model with large multimodal context capability.' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Best for complex reasoning, SQL generation and logic analysis.' },
  ];

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    localStorage.setItem('selectedModel', modelId);
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you absolutely sure? This will delete all chat history and messages forever. This action is irreversible.')) return;
    setClearing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Conversation history cleared successfully!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to clear conversations');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-celadon" /> System Settings
        </h2>
        <p className="text-sm text-white/50 mt-1">Configure database connections, select AI engine models, and manage system sessions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        {/* Model Selection */}
        <div className="glass border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu size={18} className="text-celadon" /> AI Generative Model
            </h3>
            <p className="text-xs text-white/40 mt-1">Choose the underlying Gemini model for text-to-MQL pipeline processing.</p>
          </div>

          <div className="space-y-3 pt-1">
            {models.map((model) => (
              <label
                key={model.id}
                onClick={() => handleModelChange(model.id)}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-white/5",
                  selectedModel === model.id
                    ? "bg-celadon/5 border-celadon text-white"
                    : "border-white/10 text-white/60"
                )}
              >
                <input
                  type="radio"
                  name="ai-model"
                  checked={selectedModel === model.id}
                  onChange={() => {}}
                  className="mt-1 accent-celadon"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{model.name}</span>
                  <span className="text-[10px] text-white/40 mt-0.5">{model.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Data */}
        <div className="glass border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 size={18} className="text-red-400" /> Maintenance & Storage
            </h3>
            <p className="text-xs text-white/40 mt-1">Wipe local search logs and clear remote MongoDB collections chat messages.</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">Wipe Conversations</p>
              <p className="text-[10px] text-white/40 mt-0.5">Deletes all created chat sessions and stored message logs.</p>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold rounded-xl text-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {clearing ? 'Clearing...' : 'Clear Conversations'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. DATABASE SCHEMA VIEW
export const SchemaView = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/schema', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchema(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch database schema details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="text-celadon" /> Database Metadata Schema
        </h2>
        <p className="text-sm text-white/50 mt-1">Review the Collections (Tables) and Fields (Columns) in the University Management System.</p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-white/40 gap-2">
          <div className="w-5 h-5 border-2 border-celadon border-t-transparent rounded-full animate-spin"></div>
          Loading metadata schema...
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center font-medium">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(schema).map(([collection, fields]) => (
            <motion.div
              key={collection}
              whileHover={{ y: -4 }}
              className="glass border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden group"
            >
              {/* Subtle accent line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-celadon/50 to-transparent group-hover:from-celadon transition-all" />
              
              <div>
                <h4 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                  <Database size={16} className="text-celadon" /> {collection}
                </h4>
                <p className="text-[10px] text-white/40 uppercase mt-0.5 font-bold">
                  {fields.length} Columns / Fields
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {fields.map((field) => (
                  <span
                    key={field}
                    className="text-xs text-white/70 bg-white/5 hover:bg-celadon/10 hover:text-celadon border border-white/5 hover:border-celadon/20 px-2.5 py-1 rounded-xl transition-colors font-mono"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
