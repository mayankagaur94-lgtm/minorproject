import React, { useRef, useEffect } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, ArrowRight, Zap } from 'lucide-react';

const SuggestedPrompt = ({ text, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(text)}
    className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl glass border border-white/10 text-sm text-white/60 hover:text-white text-left transition-all group"
  >
    <span>{text}</span>
    <ArrowRight size={14} className="text-celadon opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.button>
);

const ChatWindow = ({ messages, loading, onSendMessage, injectedQuery, onInjectedQueryConsumed }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const suggestions = [
    "List top 5 placement packages",
    "Find students with CGPA > 9.0",
    "Show mess menu for Wednesday",
    "Who is the dean of engineering college?"
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Background Parallax Blobs */}
      <div className="glow-blob top-[10%] left-[20%] opacity-20"></div>
      <div className="glow-blob bottom-[20%] right-[10%] bg-celadon/40 blur-[120px]"></div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 space-y-4 custom-scrollbar scroll-smooth"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-3xl bg-celadon/20 flex items-center justify-center mb-6 relative"
              >
                <Bot size={40} className="text-celadon" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-celadon flex items-center justify-center shadow-lg"
                >
                  <Zap size={12} className="text-background" fill="currentColor" />
                </motion.div>
              </motion.div>

              <h2 className="text-3xl font-bold mb-2">Welcome to Talk-to-your Database</h2>
              <p className="text-white/40 max-w-sm mb-12">
                Your intelligent assistant for the University Management System. Ask me anything about student records, faculty, or placements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                {suggestions.map((text, i) => (
                  <SuggestedPrompt key={i} text={text} onClick={onSendMessage} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => (
                  <Message key={index} message={msg} />
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-6"
                >
                  <div className="glass px-5 py-4 rounded-[24px] rounded-tl-none flex items-center gap-2">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={onSendMessage} 
        disabled={loading}
        injectedQuery={injectedQuery}
        onInjectedQueryConsumed={onInjectedQueryConsumed}
      />
    </div>
  );
};

export default ChatWindow;
