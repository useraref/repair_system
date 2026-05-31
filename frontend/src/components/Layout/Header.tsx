import React, { useState } from 'react';
import { FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  userName?: string;
  onLogout: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ userName, onLogout, notificationCount = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b">
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">📱</div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">سامانه تعمیرات موبایل</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiBell className="text-2xl text-gray-600 cursor-pointer" />
            {notificationCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{notificationCount}</span>}
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white"><FiUser /></div>
              <span>{userName || 'مدیر'}</span>
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border overflow-hidden">
                  <button onClick={onLogout} className="w-full px-4 py-3 text-right text-red-600 hover:bg-red-50 flex items-center gap-2"><FiLogOut /> خروج</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}; 
