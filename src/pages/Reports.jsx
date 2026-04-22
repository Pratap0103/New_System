import React, { useEffect, useState } from 'react';
import { getStorageData } from '../data/dummyData';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

const Reports = () => {
  const [stats, setStats] = useState({ 
    totalEnq: 0, converted: 0, pendingDispatch: 0, sales: 0 
  });

  useEffect(() => {
    const enq = getStorageData('enquiries');
    const ord = getStorageData('orders');

    setStats({
      totalEnq: enq.length,
      converted: ord.length, // simple proxy logic
      pendingDispatch: ord.filter(o => ['Invoice Created', 'Dispatch Ready'].includes(o.status)).length,
      sales: ord.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics & Reports</h1>
      </div>

      <div className="grid-3">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Enquiry Conversion</span>
            <TrendingUp color="var(--success)" size={20} />
          </div>
          <h2 style={{ fontSize: '2rem' }}>{stats.totalEnq ? Math.round((stats.converted / stats.totalEnq) * 100) : 0}%</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stats.conversions} orders out of {stats.totalEnq} enquiries</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Pending Dispatches</span>
            <BarChart3 color="var(--warning)" size={20} />
          </div>
          <h2 style={{ fontSize: '2rem' }}>{stats.pendingDispatch}</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Require immediate attention</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Gross Sales (MTD)</span>
            <TrendingUp color="var(--primary-color)" size={20} />
          </div>
          <h2 style={{ fontSize: '2rem' }}>₹{stats.sales}</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Compared to ₹0 last month</div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>AI Agent Performance Matrix</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Auto-Replies Sent within 5s</td>
              <td>98%</td>
              <td style={{ color: 'var(--success)' }}>+2.4%</td>
            </tr>
            <tr>
              <td>OCR Image Recognition Accuracy</td>
              <td>94.2%</td>
              <td style={{ color: 'var(--success)' }}>+1.1%</td>
            </tr>
            <tr>
              <td>Manual Staff Escalations</td>
              <td>14</td>
              <td style={{ color: 'var(--danger)' }}>+3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
