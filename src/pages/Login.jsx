import React, { useState } from 'react';
import { Truck, Eye, EyeOff, Lock, User } from 'lucide-react';

import { get } from '../utils/storage';

const DEFAULT_CREDENTIALS = [
  { id: 'admin', pass: 'admin123', role: 'Admin' },
  { id: 'user',  pass: 'user123',  role: 'User' }
];

const getCredentials = () => {
  const users = get('jp_users');
  return (users && users.length > 0) ? users : DEFAULT_CREDENTIALS;
};

const Login = ({ onLogin }) => {
  const [form, setForm]       = useState({ id: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const creds = getCredentials();
      const match = creds.find(c => c.id === form.id.trim() && c.pass === form.pass);
      if (match) {
        const session = { loggedIn: true, username: match.id, role: match.role, timestamp: Date.now() };
        localStorage.setItem('jp_session', JSON.stringify(session));
        onLogin(session);
      } else {
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    /* Full-page white background */
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-sky-100 overflow-hidden animate-fade-in">

        {/* Sky-blue top brand bar */}
        <div className="bg-sky-500 px-8 py-7 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white bg-opacity-25 p-3 rounded-full">
              <Truck size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Jhabka Portal</h1>
          <p className="text-sky-100 text-sm mt-1">Business Operations Hub</p>
        </div>

        {/* Form area */}
        <div className="px-8 py-7 bg-white">
          <h2 className="text-base font-semibold text-gray-700 mb-5 text-center">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="input-label">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400">
                  <User size={17} />
                </span>
                <input
                  type="text"
                  className="input-field pl-9 focus:border-sky-400 focus:shadow-sky"
                  placeholder="Enter your username"
                  value={form.id}
                  onChange={e => setForm({ ...form, id: e.target.value })}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400">
                  <Lock size={17} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-9 pr-10 focus:border-sky-400"
                  placeholder="Enter your password"
                  value={form.pass}
                  onChange={e => setForm({ ...form, pass: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-500 transition-colors"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-lg font-semibold text-white text-sm transition-all"
              style={{ background: loading ? '#7dd3fc' : '#0ea5e9' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 bg-sky-50 border border-sky-100 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-sky-700 mb-2">Default Credentials</p>
            <div className="flex justify-between">
              <span>Admin:</span>
              <span className="font-mono font-medium text-gray-700">admin / admin123</span>
            </div>
            <div className="flex justify-between">
              <span>User:</span>
              <span className="font-mono font-medium text-gray-700">user / user123</span>
            </div>
            <p className="text-sky-600 mt-2 text-center">(Manage these in Settings)</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-gray-400 text-xs text-center">
        Powered by{' '}
        <a
          href="https://www.botivate.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-500 font-semibold hover:text-sky-700 underline underline-offset-2 transition-colors"
        >
          Botivate
        </a>
      </p>
    </div>
  );
};

export default Login;
