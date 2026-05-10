import React, { useRef, useEffect } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow = ({ messages, loading, onSendMessage }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <h1 className="text-4xl font-bold mb-4">University AI Assistant</h1>
            <p className="text-lg">Ask me anything about students, grades, or placements.</p>
            <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
              {['CSE 3rd year students', 'Top 5 placement packages', 'Attendance below 75%', 'Fail students in DBMS'].map(tip => (
                <button 
                  key={tip}
                  onClick={() => onSendMessage(tip)}
                  className="p-4 border border-border/50 rounded-xl hover:bg-white/5 text-sm text-left transition-all"
                >
                  {tip}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <Message key={idx} message={msg} />
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 p-4 max-w-3xl mx-auto w-full"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
              AI
            </div>
            <div className="flex gap-1 pt-3">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-gradient-to-t from-background to-transparent">
        <ChatInput onSend={onSendMessage} disabled={loading} />
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
