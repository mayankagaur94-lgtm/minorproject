import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Terminal, Database, Table as TableIcon } from 'lucide-react';
import ResultTable from './ResultTable';

const Message = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 p-4 max-w-3xl mx-auto w-full ${isUser ? 'bg-transparent' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-blue-600' : 'bg-emerald-600'
      }`}>
        {isUser ? 'U' : 'AI'}
      </div>
      
      <div className="flex-1 space-y-4 overflow-hidden">
        <div className="text-sm leading-relaxed prose prose-invert max-w-none">
          {message.content}
        </div>

        {!isUser && message.sql_query && (
          <div className="rounded-lg overflow-hidden border border-border/50 bg-black/40">
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-border/50">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <Terminal className="w-3 h-3" />
                Generated SQL ({message.detected_language || 'en'})
              </div>
              <button className="p-1 hover:bg-white/10 rounded">
                <Copy className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
              <code>{message.sql_query}</code>
            </pre>
          </div>
        )}

        {!isUser && message.results && message.results.length > 0 && (
          <div className="rounded-lg border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-border/50 text-[10px] uppercase font-bold text-muted-foreground">
              <TableIcon className="w-3 h-3" />
              Query Results ({message.results.length} rows)
            </div>
            <ResultTable data={message.results} />
          </div>
        )}

        {!isUser && message.results && message.results.length === 0 && (
          <div className="text-sm text-amber-500 italic">
            No records found for this query.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;
