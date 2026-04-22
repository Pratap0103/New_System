import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { initializeDummyData } from './utils/dummyData';

import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Receives from './pages/Receives';
import Invoices from './pages/Invoices';
import Dispatch from './pages/Dispatch';
import Master from './pages/Master';
import Settings from './pages/Settings';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Business Operations Hub</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    initializeDummyData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="receives" element={<Receives />} />
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
