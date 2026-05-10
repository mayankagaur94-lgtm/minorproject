import React, { useState } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto relative group"
    >
      <div className="relative flex items-center glass rounded-2xl p-1 transition-shadow duration-300 focus-within:ring-2 ring-primary/20">
        <button type="button" className="p-3 text-muted-foreground hover:text-foreground">
          <Paperclip className="w-5 h-5" />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Message University AI..."
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 text-sm max-h-32 placeholder:text-muted-foreground/50"
          rows={1}
        />
        <div className="flex items-center gap-1 pr-2">
          <button type="button" className="p-3 text-muted-foreground hover:text-foreground">
            <Mic className="w-5 h-5" />
          </button>
          <button 
            type="submit"
            disabled={!text.trim() || disabled}
            className={`p-2 rounded-xl transition-all ${
              text.trim() && !disabled ? 'bg-white text-black' : 'text-muted-foreground opacity-50'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
