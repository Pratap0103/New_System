import React, { useState } from 'react';
import { Send, Image, MessageCircle } from 'lucide-react';

const Marketing = () => {
  const [message, setMessage] = useState('');

  const templates = [
    { name: 'Diwali Offer', text: 'Happy Diwali 🎉 Jhabka Tractor ki taraf se special discount on all spare parts!' },
    { name: 'New Stock', text: 'Namaste! Naya stock aa gaya hai. Checkout our newly arrived John Deere parts.' },
    { name: 'Harvest Season', text: 'Harvest season special: Get 10% off on all heavy duty water pumps. Buy now!' }
  ];

  const handleBroadcast = () => {
    if (!message) return;
    alert(`Broadcast Sent to all customers in Database via WhatsApp API!\n\nPayload:\n"${message}"`);
    setMessage('');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Marketing Automation</h1>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle size={18} color="var(--primary-color)" />
            Compose Broadcast Message
          </h3>

          <div className="input-group">
            <label className="input-label">Select Template (Optional)</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {templates.map(t => (
                <button 
                  key={t.name} 
                  className="badge" 
                  style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onClick={() => setMessage(t.text)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Message Content</label>
            <textarea 
              className="input-field" 
              rows="6" 
              placeholder="Type your WhatsApp greeting or offer here..." 
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="input-group">
            <button className="btn btn-secondary" style={{ width: 'fit-content' }}>
              <Image size={16} /> Attach Marketing Flyer
            </button>
          </div>

          <button onClick={handleBroadcast} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            <Send size={18} /> Send Broadcast to All Customers
          </button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Broadcasts</h3>
          <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Last Week</div>
              <div style={{ fontWeight: '500' }}>Holi Greetings 🎨</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Delivered to 240 customers. Read by 180.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Last Month</div>
              <div style={{ fontWeight: '500' }}>Pump Restock Alert</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Delivered to 150 customers. Read by 120. Generated 14 orders.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
