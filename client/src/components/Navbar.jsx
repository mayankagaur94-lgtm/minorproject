import React from 'react';
import { Search, Bell, User, LayoutGrid, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="h-16 flex items-center justify-between px-6 glass border-b border-white/10 relative z-10">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-celadon flex items-center justify-center shadow-lg shadow-celadon/20">
          <LayoutGrid className="text-background w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Talk-to-your Database
          </h1>
          <p className="text-[10px] text-celadon font-medium tracking-widest uppercase">
            University Management
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-celadon transition-colors" />
          <input
            type="text"
            placeholder="Search queries, students, data..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-celadon/50 focus:bg-white/10 transition-all placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-celadon rounded-full border-2 border-background"></span>
        </motion.button>

        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 pl-2 cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white/90">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-white/40">{user?.department || 'IT Department'}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-celadon/30 p-0.5 shadow-xl shadow-black/20">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`}
              alt="avatar"
              className="w-full h-full rounded-full bg-white/10"
            />
          </div>
        </motion.div>

        {onLogout && (
          <>
            <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
