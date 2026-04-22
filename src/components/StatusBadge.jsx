import React from 'react';

const StatusBadge = ({ status }) => {
  const badgeColors = {
    'Pending': 'bg-gray-100 text-gray-800',
    'Follow Up': 'bg-yellow-100 text-yellow-800',
    'Order Received': 'bg-indigo-100 text-indigo-800',
    'Available': 'bg-indigo-100 text-indigo-800',
    'Not Available': 'bg-orange-100 text-orange-800',
    'Purchased': 'bg-orange-200 text-orange-900', // corral equivalent
    'PendingReceive': 'bg-orange-200 text-orange-900', 
    'Received': 'bg-teal-100 text-teal-800',
    'Invoiced': 'bg-purple-100 text-purple-800',
    'Dispatched': 'bg-cyan-100 text-cyan-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Closed': 'bg-green-100 text-green-800',
    'Order Cancelled': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  const colorClass = badgeColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
