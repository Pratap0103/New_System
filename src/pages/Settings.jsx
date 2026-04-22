import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { Save } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    businessName: '', gstin: '', address1: '', address2: '', city: '', state: '',
    pin: '', phone: '', email: '', defaultGst: 18, invoicePrefix: 'INV-'
  });

  const [users, setUsers] = useState([
    { id: 'admin', pass: 'admin123', role: 'Admin' },
    { id: 'user',  pass: 'user123',  role: 'User' }
  ]);

  useEffect(() => {
    const data = get('jp_settings');
    if (data && !Array.isArray(data)) {
      setSettings(data);
    }
    const storedUsers = get('jp_users');
    if (storedUsers && storedUsers.length > 0) {
      setUsers(storedUsers);
    }
  }, []);

  const handleSave = () => {
    if (users.some(u => !u.id.trim() || !u.pass)) return alert("Usernames and passwords cannot be empty.");
    save('jp_settings', settings);
    save('jp_users', users);
    alert('Business Settings & User Accounts successfully updated.');
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Business Configuration</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your portal identity and invoice configurations.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={handleSave}>
          <Save size={16} />
          Save Settings
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-6">
        {/* Company Info */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4">Company Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div><label className="input-label">Business Name</label><input className="input-field" value={settings.businessName} onChange={e => setSettings({...settings, businessName: e.target.value})} /></div>
            <div><label className="input-label">GSTIN / TRN</label><input className="input-field" value={settings.gstin} onChange={e => setSettings({...settings, gstin: e.target.value})} /></div>
          </div>
        </div>

        {/* Contact */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Contact Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div><label className="input-label">Email Address</label><input className="input-field" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} /></div>
            <div><label className="input-label">Phone Number</label><input className="input-field" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} /></div>
          </div>
        </div>

        {/* Location */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Location</h3>
          <div className="space-y-4">
            <div><label className="input-label">Address Line 1</label><input className="input-field" value={settings.address1} onChange={e => setSettings({...settings, address1: e.target.value})} /></div>
            <div><label className="input-label">Address Line 2 (Optional)</label><input className="input-field" value={settings.address2} onChange={e => setSettings({...settings, address2: e.target.value})} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="input-label">City</label><input className="input-field" value={settings.city} onChange={e => setSettings({...settings, city: e.target.value})} /></div>
              <div><label className="input-label">State</label><input className="input-field" value={settings.state} onChange={e => setSettings({...settings, state: e.target.value})} /></div>
              <div><label className="input-label">PIN / ZIP Code</label><input className="input-field" value={settings.pin} onChange={e => setSettings({...settings, pin: e.target.value})} /></div>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Financial Configurations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div><label className="input-label">Default GST Rate (%)</label><input type="number" className="input-field" value={settings.defaultGst} onChange={e => setSettings({...settings, defaultGst: Number(e.target.value)})} /></div>
            <div><label className="input-label">Invoice Number Prefix</label><input className="input-field" value={settings.invoicePrefix} onChange={e => setSettings({...settings, invoicePrefix: e.target.value})} /></div>
          </div>
        </div>

        {/* User Management */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">User Accounts & Access</h3>
          <div className="space-y-4">
            {users.map((user, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex-1">
                  <label className="input-label">Username (ID) <span className="text-red-500">*</span></label>
                  <input className="input-field bg-white" value={user.id} onChange={e => {
                    const newUsers = [...users];
                    newUsers[idx].id = e.target.value;
                    setUsers(newUsers);
                  }} />
                </div>
                <div className="flex-1">
                  <label className="input-label">Password <span className="text-red-500">*</span></label>
                  <input className="input-field bg-white" value={user.pass} onChange={e => {
                    const newUsers = [...users];
                    newUsers[idx].pass = e.target.value;
                    setUsers(newUsers);
                  }} />
                </div>
                <div className="w-full sm:w-1/3">
                  <label className="input-label">Role</label>
                  <select className="input-field bg-white" value={user.role} onChange={e => {
                    const newUsers = [...users];
                    newUsers[idx].role = e.target.value;
                    setUsers(newUsers);
                  }}>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                </div>
                {users.length > 1 && (
                  <div className="flex items-end pb-1">
                    <button onClick={() => setUsers(users.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-2">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => setUsers([...users, { id: '', pass: '', role: 'User' }])} className="btn btn-secondary text-sm py-2">
              + Add Another User
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Save button at bottom for convenience */}
      <div className="sm:hidden">
        <button className="btn btn-primary w-full py-3 flex items-center justify-center gap-2" onClick={handleSave}>
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
