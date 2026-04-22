import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, UserCircle, Search } from 'lucide-react';

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {/* Topbar Component inside layout structure */}
        <header style={{ 
          height: '64px', 
          backgroundColor: 'var(--surface-color)', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)' }}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search enquiries, orders or customers..." 
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '300px', fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Bell size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <UserCircle size={28} color="var(--primary-color)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Admin User</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin Role</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="page-wrapper animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
