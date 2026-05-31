import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home } from './pages/Home';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerPortal } from './pages/CustomerPortal';
import { Tracking } from './pages/Tracking';
import { useAuthStore } from './store/authStore';

function App() {
  const [page, setPage] = useState('home');
  const [trackingCode, setTrackingCode] = useState('');
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <>
      <Toaster position="top-center" />
      {page === 'home' && <Home onNavigate={(p) => setPage(p)} />}
      {page === 'login' && <AdminLogin onLogin={() => setPage('dashboard')} />}
      {page === 'dashboard' && isAuthenticated && <AdminDashboard onLogout={() => { logout(); setPage('home'); }} />}
      {page === 'customer' && <CustomerPortal onBack={() => setPage('home')} onTracking={(code) => { setTrackingCode(code); setPage('tracking'); }} />}
      {page === 'tracking' && <Tracking code={trackingCode} onBack={() => setPage('customer')} />}
    </>
  );
}

export default App; 
