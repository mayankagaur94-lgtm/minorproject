import React from 'react';
import { Plus, MessageSquare, User, LogOut, Settings } from 'lucide-react';

const Sidebar = ({ chats, currentChatId, onNewChat, onSelectChat, user }) => {
  return (
    <aside className="w-64 glass h-full flex flex-col border-r border-border/40">
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg border border-border/50 hover:bg-white/5 transition-all duration-200 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Chats
        </div>
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
              currentChatId === chat.id ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="truncate text-left">{chat.title}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-border/40 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer transition-all">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role || 'Student'}</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
