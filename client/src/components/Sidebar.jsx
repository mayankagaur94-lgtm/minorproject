import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  History,
  Bookmark,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Sparkles,
  Search,
  X,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  user,
  activeTab,
  onTabChange,
  searchQuery,
  setSearchQuery
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: MessageSquare, label: 'Chat', id: 'chat' },
    { icon: Database, label: 'Database Schema', id: 'schema' },
    { icon: History, label: 'History', id: 'history' },
    { icon: Bookmark, label: 'Saved Queries', id: 'saved' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen glass border-r border-white/10 flex flex-col relative z-20"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-celadon text-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* New Chat Button */}
      <div className="p-4 pt-8">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(172, 225, 175, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onNewChat();
            onTabChange('chat');
          }}
          className={cn(
            "w-full flex items-center justify-center gap-2 bg-celadon text-background font-bold py-3 rounded-2xl transition-all shadow-xl cursor-pointer",
            collapsed && "px-0"
          )}
        >
          <Plus size={20} strokeWidth={3} />
          {!collapsed && <span>New Chat</span>}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 overflow-y-auto space-y-1 custom-scrollbar">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 4 }}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group",
              activeTab === item.id
                ? "bg-white/10 text-celadon border border-white/5"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id ? "text-celadon" : "group-hover:text-celadon transition-colors")} />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </motion.div>
        ))}

        <div className="my-6 border-t border-white/5 mx-2"></div>

        {/* Search Chat Input (Replacing static chat bar/header) */}
        {!collapsed && (
          <div className="px-2 mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats or queries..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder:text-white/20 outline-none focus:border-celadon/50 transition-colors"
              />
              <span className="absolute left-3 top-2.5 text-white/30">
                <Search size={13} />
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-white/30 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat History */}
        {!collapsed && (
          <div className="px-2 mb-2 flex items-center gap-2 text-white/30">
            <Sparkles size={12} className="text-celadon" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {searchQuery ? 'Search Results' : 'Recent Chats'}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-64">
          <AnimatePresence mode="popLayout">
            {chats.map((chat) => (
              <motion.div
                layout
                key={chat._id || chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => {
                  onSelectChat(chat._id || chat.id);
                  onTabChange('chat');
                }}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1",
                  (activeTab === 'chat' && currentChatId === (chat._id || chat.id))
                    ? "bg-celadon/10 border border-celadon/20 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className={cn((activeTab === 'chat' && currentChatId === (chat._id || chat.id)) ? "text-celadon" : "text-white/30")} />
                  {!collapsed && (
                    <span className="text-sm truncate w-40">
                      {chat.title || 'New Conversation'}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id || chat.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white/40" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-[10px] text-white/30 uppercase font-bold">Plan</p>
              <p className="text-xs font-medium text-celadon">Premium Pro</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
