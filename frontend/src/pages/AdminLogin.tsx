import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await authApi.login(form.get('username') as string, form.get('password') as string);
      if (res.data.success) {
        login(res.data.user);
        toast.success('خوش آمدید');
        onLogin();
      } else {
        toast.error('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">🔐 ورود به پنل مدیریت</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="نام کاربری" className="w-full p-3 border rounded-xl mb-3" required />
          <input type="password" name="password" placeholder="رمز عبور" className="w-full p-3 border rounded-xl mb-4" required />
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50">
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-gray-500">admin / admin123</div>
        <div className="text-center mt-2"><a href="../index.php" className="text-gray-400 text-sm">← بازگشت</a></div>
      </motion.div>
    </div>
  );
}; 
