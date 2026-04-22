import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, ShoppingCart, Package, Truck, FileText, 
  Settings, ArchiveRestore, Database
} from 'lucide-react';
import { get } from '../utils/storage';

const Sidebar = () => {
  // get counts dynamically for badges
  const enqCount = get('jp_enquiries').filter(e => !['Order Received', 'Order Cancelled'].includes(e.status)).length;
  const ordCount = get('jp_orders').filter(o => o.status === 'Pending').length;
  const purCount = get('jp_purchases').filter(p => p.status === 'Purchased').length; // Means pending receives technically
  const recCount = get('jp_receives').filter(r => r.status === 'Pending').length;
  const invCount = get('jp_invoices').filter(i => i.status === 'Pending').length;
  const dispCount = get('jp_dispatches').filter(d => d.status === 'Pending').length;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Enquiries', path: '/enquiries', icon: MessageSquare, badge: enqCount },
    { name: 'Orders', path: '/orders', icon: ShoppingCart, badge: ordCount },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Purchases', path: '/purchases', icon: ShoppingCart, badge: purCount },
    { name: 'Receives', path: '/receives', icon: ArchiveRestore, badge: recCount },
    { name: 'Invoices', path: '/invoices', icon: FileText, badge: invCount },
    { name: 'Dispatch', path: '/dispatch', icon: Truck, badge: dispCount },
    { name: 'Master', path: '/master', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Truck className="text-indigo-400" />
          Jhabka Portal
        </h2>
        <p className="text-xs text-gray-400 mt-1">Order Mgmt V3</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive 
                      ? 'bg-indigo-600 text-white font-medium' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.name}
                </div>
                {item.badge > 0 && (
                  <span className="bg-indigo-500 text-white text-xs py-0.5 px-2 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
