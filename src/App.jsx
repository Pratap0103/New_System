import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { initializeDummyData } from './utils/dummyData';
import { Menu, Bell, UserCircle, LogOut } from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Receives from './pages/Receives';
import Assemble from './pages/Assemble';
import Invoices from './pages/Invoices';
import Dispatch from './pages/Dispatch';
import Master from './pages/Master';
import Settings from './pages/Settings';

/* ─── Persistent Footer ─────────────────────────────────────── */
const Footer = () => (
  <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 py-1.5 text-center text-xs text-gray-400 select-none">
    Powered by{' '}
    <a
      href="https://www.botivate.in"
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
    >
      Botivate
    </a>
  </footer>
);

/* ─── Main Layout (authenticated) ──────────────────────────── */
const Layout = ({ session, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-sm sm:text-base font-semibold text-gray-800 tracking-tight truncate">
              Business Operations Hub
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-1.5">
              <UserCircle size={24} className="text-indigo-600 shrink-0" />
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-gray-800 leading-none">{session?.username}</p>
                <p className="text-xs text-gray-400 leading-none mt-0.5">{session?.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors ml-1"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content — bottom padding accounts for fixed footer */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-10">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

/* ─── App Root ──────────────────────────────────────────────── */
function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeDummyData();
    // Restore session from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('jp_session') || 'null');
      if (stored?.loggedIn) setSession(stored);
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const handleLogin = (s) => setSession(s);

  const handleLogout = () => {
    localStorage.removeItem('jp_session');
    setSession(null);
  };

  if (!ready) return null; // wait for localStorage check

  if (!session?.loggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout session={session} onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="receives" element={<Receives />} />
          <Route path="assemble" element={<Assemble />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="dispatch" element={<Dispatch />} />
          <Route path="master" element={<Master />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
