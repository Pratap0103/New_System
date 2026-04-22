import React, { useState, useEffect } from 'react';
import { getStorageData } from '../data/dummyData';
import { User, Phone, MapPin } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    setCustomers(getStorageData('customers'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customer Database</h1>
      </div>

      <div className="card table-container" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Profile Info</th>
              <th>Contact & Location</th>
              <th>Products Interested</th>
              <th>Total LTV</th>
              <th>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: '600' }}>{c.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                      <User size={16} />
                    </div>
                    {c.name}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}><Phone size={12}/> {c.phone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><MapPin size={12}/> {c.location}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {c.interests.map(i => <span key={i} className="badge primary" style={{ fontSize: '0.65rem' }}>{i}</span>)}
                  </div>
                </td>
                <td style={{ fontWeight: 'bold' }}>₹{c.totalPurchase}</td>
                <td>{new Date(c.lastOrderDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
