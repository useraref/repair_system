import React from 'react';
import { motion } from 'framer-motion';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="text-7xl mb-4 animate-float">📱</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">سامانه تعمیرات موبایل</h1>
        <p className="text-gray-500 mb-8">مدیریت حرفه‌ای تعمیرات</p>
        <div className="space-y-3">
          <button onClick={() => onNavigate('customer')} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition">👤 پنل مشتری</button>
          <button onClick={() => onNavigate('login')} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">🔐 پنل مدیریت</button>
        </div>
      </motion.div>
    </div>
  );
}; 
