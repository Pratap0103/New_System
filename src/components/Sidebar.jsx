import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, ShoppingCart, Package, Truck, FileText,
  Settings, ArchiveRestore, Database, X
} from 'lucide-react';
import { get } from '../utils/storage';

const computeCounts = () => ({
  enq: get('jp_enquiries').filter(e => !['Order Received', 'Order Cancelled'].includes(e.status)).length,
  ord: get('jp_orders').filter(o => o.status === 'Pending').length,
  pur: get('jp_purchases').filter(p => !p.status || p.status === 'Pending').length,
  rec: get('jp_receives').filter(r => !r.status || r.status === 'Pending').length,
  asm: get('jp_assembles').filter(a => !a.status || a.status === 'Pending').length,
  inv: get('jp_invoices').filter(i => !i.status || i.status === 'Pending').length,
  dis: get('jp_dispatches').filter(d => !d.status || d.status === 'Pending').length,
});

const Sidebar = ({ mobileOpen, onClose }) => {
  const [counts, setCounts] = useState(computeCounts);

  const refresh = useCallback(() => setCounts(computeCounts()), []);
  useEffect(() => {
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [refresh]);

  const navItems = [
    { name: 'Dashboard',  path: '/',           icon: LayoutDashboard },
    { name: 'Inventory',  path: '/inventory',  icon: Package },
    { name: 'Enquiries',  path: '/enquiries',  icon: MessageSquare,  badge: counts.enq },
    { name: 'Orders',     path: '/orders',     icon: ShoppingCart,   badge: counts.ord },
    { name: 'Assemble',   path: '/assemble',   icon: Package,        badge: counts.asm },
    { name: 'Invoices',   path: '/invoices',   icon: FileText,       badge: counts.inv },
    { name: 'Dispatch',   path: '/dispatch',   icon: Truck,          badge: counts.dis },
    { name: 'Purchases',  path: '/purchases',  icon: ShoppingCart,   badge: counts.pur },
    { name: 'Receives',   path: '/receives',   icon: ArchiveRestore, badge: counts.rec },
    { name: 'Master',     path: '/master',     icon: Database },
    { name: 'Settings',   path: '/settings',   icon: Settings },
  ];

  const sidebarContent = (
    /* White sidebar with sky-blue accents */
    <aside className="w-64 bg-white flex flex-col h-full border-r border-gray-200">

      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-sky-500 p-1.5 rounded-lg">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Jhabka Portal</p>
            <p className="text-xs text-gray-400 mt-0.5">Order Mgmt V3</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-gray-700 p-1 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-sky-50 hover:text-sky-700'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon size={17} />
                  {item.name}
                </div>
                {item.badge > 0 && (
                  <span className="bg-sky-100 text-sky-700 text-xs py-0.5 px-2 rounded-full font-semibold min-w-[20px] text-center leading-4">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Powered by{' '}
          <a
            href="https://www.botivate.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-500 font-semibold hover:text-sky-700 transition-colors"
          >
            Botivate
          </a>
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
