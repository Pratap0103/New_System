import React, { useState, useEffect } from 'react';
import { get } from '../utils/storage';
import { MessageSquare, ShoppingCart, ArchiveRestore, Truck, FileText, AlertCircle, Package } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    followUps: 0,
    ordersPending: 0,
    purchasesPending: 0,
    toReceive: 0,
    invoicesToCreate: 0,
    dispatchPending: 0,
    revenue: 0,
    lowStock: 0,
    recentActivity: []
  });

  useEffect(() => {
    const enq = get('jp_enquiries');
    const ord = get('jp_orders');
    const inv = get('jp_inventory');
    const pur = get('jp_purchases');
    const rec = get('jp_receives');
    const invs = get('jp_invoices');
    const dis = get('jp_dispatches');

    setStats({
      totalEnquiries: enq.length,
      followUps: enq.filter(e => e.status === 'Follow Up').length,
      ordersPending: ord.filter(o => o.status === 'Pending').length,
      purchasesPending: pur.filter(p => !p.status || p.status === 'Pending').length,
      toReceive: rec.filter(r => r.status === 'Pending').length,
      invoicesToCreate: invs.filter(i => i.status === 'Pending').length,
      dispatchPending: dis.filter(d => d.status === 'Pending').length,
      revenue: invs.filter(i => i.status === 'Invoiced').reduce((acc, curr) => acc + curr.totalAmount, 0),
      lowStock: inv.filter(i => i.availableStock < 5).length,
      recentActivity: [
        { type: 'New Enquiry', desc: 'Received a new order enquiry from Rahul', time: '10 mins ago' },
        { type: 'Invoice Created', desc: 'INV-1718000000 sent to Suresh', time: '1 hour ago' },
        { type: 'Stock Update', desc: 'Bearing 6204 dropped below threshold', time: '2 hours ago' }
      ]
    });
  }, []);

  const Card = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-md ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Summary</h2>
          <p className="text-sm text-gray-500">Overview of today's business activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Enquiries" value={stats.totalEnquiries} icon={MessageSquare} colorClass="bg-blue-100 text-blue-600" />
        <Card title="Pending Follow-Ups" value={stats.followUps} icon={MessageSquare} colorClass="bg-yellow-100 text-yellow-600" />
        <Card title="Orders Stock Check" value={stats.ordersPending} icon={ShoppingCart} colorClass="bg-indigo-100 text-indigo-600" />
        <Card title="Pending Purchases" value={stats.purchasesPending} icon={ShoppingCart} colorClass="bg-orange-100 text-orange-600" />
        
        <Card title="Items to Receive" value={stats.toReceive} icon={ArchiveRestore} colorClass="bg-teal-100 text-teal-600" />
        <Card title="Invoices to Create" value={stats.invoicesToCreate} icon={FileText} colorClass="bg-purple-100 text-purple-600" />
        <Card title="Pending Dispatch" value={stats.dispatchPending} icon={Truck} colorClass="bg-cyan-100 text-cyan-600" />
        <Card title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={FileText} colorClass="bg-green-100 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-gray-500"/> Activity Feed
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {stats.recentActivity.map((act, i) => (
              <div key={i} className="flex gap-4 p-3 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-100 transition-colors">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0"></div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{act.desc}</p>
                  <p className="text-xs text-gray-500 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 text-red-600">
            <AlertCircle size={20} /> Alerts
          </h3>
          {stats.lowStock > 0 ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-100 text-sm">
              <strong>{stats.lowStock} Items</strong> in the inventory have dropped below 5 units. Please initiate a purchase request.
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-100 text-sm">
              All inventory levels are healthy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
