import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sparkles, Terminal, Database, Languages, FileSpreadsheet, Check, ChevronDown, Table, Headphones, Bookmark } from 'lucide-react';
import ResultTable from './ResultTable';
import GraphView from './GraphView';
import axios from 'axios';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CsvCard = ({ csvFile }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState(null);
  const [targetCollection, setTargetCollection] = useState('students');
  const [showDropdown, setShowDropdown] = useState(false);

  const collections = ['students', 'placements', 'faculty', 'marks', 'hostel', 'mess', 'bus', 'admissions'];

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/import-csv', {
        collectionName: targetCollection,
        rows: csvFile.rows
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImported(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col gap-3 text-white max-w-md w-full shadow-lg mt-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-soft/10 text-emerald-soft border border-emerald-soft/20">
            <FileSpreadsheet size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold truncate max-w-[180px]">{csvFile.name}</span>
            <span className="text-[10px] opacity-40">{csvFile.rows.length} records • {csvFile.headers.length} fields</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowPreview(!showPreview)} 
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Preview Data"
        >
          <Table size={16} />
        </button>
      </div>

      {/* CSV Preview Drawer */}
      {showPreview && (
        <div className="max-h-48 overflow-auto border border-white/5 rounded-lg bg-black/20 custom-scrollbar">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 sticky top-0">
                {csvFile.headers.map((h, i) => (
                  <th key={i} className="px-2 py-1.5 font-bold uppercase opacity-65">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvFile.rows.slice(0, 5).map((row, ri) => (
                <tr key={ri} className="border-b border-white/5 hover:bg-white/5">
                  {csvFile.headers.map((h, hi) => (
                    <td key={hi} className="px-2 py-1">{row[h] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {csvFile.rows.length > 5 && (
            <div className="p-1.5 text-center text-[9px] opacity-40 bg-black/10">
              Showing first 5 rows of {csvFile.rows.length} total rows
            </div>
          )}
        </div>
      )}

      {/* Import actions */}
      <div className="flex items-center justify-between border-t border-white/5 pt-2 gap-2 text-xs">
        {imported ? (
          <div className="flex items-center gap-1.5 text-emerald-soft font-medium">
            <Check size={14} /> Imported to '{targetCollection}'
          </div>
        ) : (
          <>
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10 text-[11px]"
              >
                Collection: <span className="font-bold text-celadon">{targetCollection}</span>
                <ChevronDown size={12} />
              </button>
              {showDropdown && (
                <div className="absolute left-0 bottom-full mb-1 z-50 bg-neutral-950 border border-white/10 rounded-xl py-1 w-32 shadow-2xl overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                  {collections.map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setTargetCollection(col);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                      {col}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="px-3 py-1 rounded-lg bg-celadon text-background hover:bg-celadon-dark disabled:opacity-50 transition-all font-semibold text-[11px] flex items-center gap-1 shadow-lg"
            >
              {importing ? 'Importing...' : 'Import to DB'}
            </button>
          </>
        )}
      </div>
      {error && (
        <span className="text-[10px] text-red-400 mt-1">{error}</span>
      )}
    </div>
  );
};

// Save Query Bookmark Button
const SaveQueryButton = ({ message }) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const title = window.prompt('Give this saved query a name:', message.content?.substring(0, 50) || 'Saved Query');
    if (!title) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/saved-queries', {
        title: title.trim(),
        queryText: message.content || '',
        mqlQuery: message.generated_query,
        collectionName: message.collection || 'students',
        type: Array.isArray(message.generated_query) ? 'aggregation' : 'find'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaved(true);
    } catch (err) {
      console.error('Save query failed:', err);
      alert('Failed to save query. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      title={saved ? 'Query Saved!' : 'Save this query'}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer
        ${saved
          ? 'bg-celadon/20 text-celadon border-celadon/30 cursor-default'
          : 'bg-white/5 hover:bg-celadon/10 text-white/50 hover:text-celadon border-white/10 hover:border-celadon/30'
        }`}
    >
      <Bookmark size={11} className={saved ? 'fill-celadon' : ''} />
      {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Query'}
    </button>
  );
};

// CSV Export Helper
const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  
  // Recursively flatten rows to columns
  const flattenObject = (obj, prefix = '') => {
    let result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === '__v') continue;
        const newKey = prefix ? `${prefix}.${key}` : key;
        const val = obj[key];
        if (val === null || val === undefined) {
          result[newKey] = '';
        } else if (typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
          if (val.$oid) result[newKey] = val.$oid;
          else if (val.$date) result[newKey] = new Date(val.$date).toISOString();
          else Object.assign(result, flattenObject(val, newKey));
        } else if (Array.isArray(val)) {
          result[newKey] = val.map(i => typeof i === 'object' ? JSON.stringify(i) : i.toString()).join('; ');
        } else {
          result[newKey] = val;
        }
      }
    }
    return result;
  };

  const flattenedData = data.map(row => flattenObject(row));
  const headers = Array.from(
    new Set(flattenedData.reduce((acc, row) => acc.concat(Object.keys(row)), []))
  );

  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of flattenedData) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + (val !== undefined && val !== null ? val : '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// SQL / MQL Code Card Viewer Component
const CodeViewer = ({ message }) => {
  const [activeCodeTab, setActiveCodeTab] = useState('mql'); // mql or sql

  return (
    <div className="glass-celadon rounded-2xl overflow-hidden mt-2">
      <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-celadon" />
          <div className="flex bg-black/20 border border-white/10 rounded-lg p-0.5 text-[10px]">
            <button
              onClick={() => setActiveCodeTab('mql')}
              className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${activeCodeTab === 'mql' ? 'bg-celadon text-background' : 'text-white/60 hover:text-white'}`}
            >
              MQL (Mongo)
            </button>
            {message.sql_query && (
              <button
                onClick={() => setActiveCodeTab('sql')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${activeCodeTab === 'sql' ? 'bg-celadon text-background' : 'text-white/60 hover:text-white'}`}
              >
                SQL Query
              </button>
            )}
          </div>
        </div>
        <SaveQueryButton message={message} />
      </div>
      <pre className="p-3 text-[11px] font-mono text-celadon overflow-x-auto whitespace-pre-wrap max-h-48 custom-scrollbar">
        {activeCodeTab === 'mql'
          ? (typeof message.generated_query === 'object' 
              ? JSON.stringify(message.generated_query, null, 2) 
              : message.generated_query)
          : message.sql_query}
      </pre>
    </div>
  );
};

// Result Container with Table / Graph views
const ResultContainer = ({ results }) => {
  const [activeView, setActiveView] = useState('table'); // table or graph

  const hasNumeric = useMemo(() => {
    if (!results || results.length === 0) return false;
    const sample = results[0];
    return Object.keys(sample).some(key => {
      if (key === '_id' || key === 'id' || key === '__v') return false;
      const values = results.map(d => d[key]);
      const validNumbers = values.filter(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v))));
      return validNumbers.length > results.length * 0.5;
    });
  }, [results]);

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl w-full mt-2">
      <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-celadon" />
          <span className="text-xs font-bold text-white/70">Query Results ({results.length})</span>
        </div>
        
        <div className="flex items-center gap-3">
          {hasNumeric && (
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveView('table')}
                className={`px-3 py-1 rounded-md transition-all font-semibold cursor-pointer ${activeView === 'table' ? 'bg-celadon text-background' : 'text-white/60 hover:text-white'}`}
              >
                Table View
              </button>
              <button
                onClick={() => setActiveView('graph')}
                className={`px-3 py-1 rounded-md transition-all font-semibold cursor-pointer ${activeView === 'graph' ? 'bg-celadon text-background' : 'text-white/60 hover:text-white'}`}
              >
                Graph View
              </button>
            </div>
          )}
          
          <button
            onClick={() => exportToCSV(results, `query_results_${Date.now()}.csv`)}
            className="flex items-center gap-1.5 px-3 py-1 bg-celadon/10 hover:bg-celadon/20 text-celadon border border-celadon/30 hover:border-celadon/50 transition-all font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="p-2 bg-black/10">
        {activeView === 'table' ? (
          <ResultTable data={results} />
        ) : (
          <GraphView data={results} />
        )}
      </div>
    </div>
  );
};

const Message = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[85%] md:max-w-[70%] flex flex-col",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "px-4 py-3 rounded-[24px] shadow-xl transition-all relative group",
          isUser 
            ? "bg-gradient-to-br from-celadon to-celadon-dark text-background font-medium rounded-tr-none" 
            : "glass text-white/90 border-white/10 rounded-tl-none"
        )}>
          {isAssistant && (
            <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-celadon animate-pulse" />
            </div>
          )}

          {message.content && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          )}

          {/* User Attachments Display */}
          {isUser && (message.csvFile || message.imageFile || message.audioFile) && (
            <div className="mt-2 space-y-2 w-full min-w-[240px]">
              {message.imageFile && (
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-md max-w-sm mt-1">
                  <img src={message.imageFile.previewUrl} alt="Attached" className="max-h-60 w-auto object-contain" />
                </div>
              )}
              
              {message.audioFile && (
                <div className="flex flex-col gap-1 mt-1 p-2 rounded-2xl bg-black/10 border border-white/5">
                  <span className="text-[9px] opacity-40 uppercase font-bold tracking-wider flex items-center gap-1"><Headphones size={10} /> Voice Search</span>
                  <audio src={message.audioFile.previewUrl} controls className="rounded-lg accent-celadon w-full h-8 mt-1" />
                </div>
              )}
              
              {message.csvFile && (
                <CsvCard csvFile={message.csvFile} />
              )}
            </div>
          )}

          {/* Timestamp (Subtle) */}
          <div className={cn(
            "text-[10px] mt-1 opacity-0 group-hover:opacity-40 transition-opacity",
            isUser ? "text-background" : "text-white"
          )}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* AI Enhancements (SQL, Results, etc.) */}
        {isAssistant && message.generated_query && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 w-full space-y-3"
          >
            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2">
              {message.detected_language && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 uppercase font-bold tracking-tighter">
                  <Languages size={10} /> {message.detected_language}
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-celadon/10 border border-celadon/20 text-[10px] text-celadon uppercase font-bold tracking-tighter">
                <Database size={10} /> MQL Generated
              </div>
            </div>

            {/* Schema Links */}
            {message.schema_links && message.schema_links.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {message.schema_links.map((link, idx) => (
                  <span key={idx} className="text-[9px] font-semibold text-white/50 bg-white/5 px-2 py-0.5 border border-white/5 rounded-md">
                    🔗 {link}
                  </span>
                ))}
              </div>
            )}

            {/* SQL/MQL Code Card */}
            <CodeViewer message={message} />

            {/* Result Table / Graph Card */}
            {message.results && message.results.length > 0 && (
              <ResultContainer results={message.results} />
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;

