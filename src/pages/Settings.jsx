import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';

const Settings = () => {
  const [settings, setSettings] = useState({
    businessName: '', gstin: '', address1: '', address2: '', city: '', state: '', 
    pin: '', phone: '', email: '', defaultGst: 18, invoicePrefix: 'INV-'
  });

  useEffect(() => {
    const data = get('jp_settings');
    if (data && !Array.isArray(data)) {
      setSettings(data);
    }
  }, []);

  const handleSave = () => {
    save('jp_settings', settings);
    alert('Business Settings successfully updated. These will reflect on future Invoice PDFs.');
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Configuration</h2>
          <p className="text-sm text-gray-500">Manage your portal identity and invoice configurations.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="input-label">Business Name</label><input className="input-field" value={settings.businessName} onChange={e => setSettings({...settings, businessName: e.target.value})} /></div>
          <div><label className="input-label">GSTIN / TRN</label><input className="input-field" value={settings.gstin} onChange={e => setSettings({...settings, gstin: e.target.value})} /></div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t border-gray-100">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="input-label">Email Address</label><input className="input-field" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} /></div>
          <div><label className="input-label">Phone Number</label><input className="input-field" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} /></div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t border-gray-100">Location</h3>
        <div className="space-y-4">
          <div><label className="input-label">Address Line 1</label><input className="input-field" value={settings.address1} onChange={e => setSettings({...settings, address1: e.target.value})} /></div>
          <div><label className="input-label">Address Line 2 (Optional)</label><input className="input-field" value={settings.address2} onChange={e => setSettings({...settings, address2: e.target.value})} /></div>
          <div className="grid grid-cols-3 gap-4">
             <div><label className="input-label">City</label><input className="input-field" value={settings.city} onChange={e => setSettings({...settings, city: e.target.value})} /></div>
             <div><label className="input-label">State</label><input className="input-field" value={settings.state} onChange={e => setSettings({...settings, state: e.target.value})} /></div>
             <div><label className="input-label">PIN / ZIP Code</label><input className="input-field" value={settings.pin} onChange={e => setSettings({...settings, pin: e.target.value})} /></div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t border-gray-100">Financial Configurations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="input-label">Default GST Rate (%)</label><input type="number" className="input-field" value={settings.defaultGst} onChange={e => setSettings({...settings, defaultGst: Number(e.target.value)})} /></div>
          <div><label className="input-label">Invoice Number Prefix</label><input className="input-field" value={settings.invoicePrefix} onChange={e => setSettings({...settings, invoicePrefix: e.target.value})} /></div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
