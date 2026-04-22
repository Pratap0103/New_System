import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import SearchBar from '../components/SearchBar';
import { CheckCircle, Package, Clock, ListChecks } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Assemble = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    setData(get('jp_assembles') || []);
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Assembled');

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.orderId, q) || match(d.personName, q) || (d.items && d.items.some(i => match(i.name, q)));
      const matchPriority = !filterPriority || d.priority === filterPriority;
      return matchSearch && matchPriority;
    });
  };

  const baseData = activeTab === 'pending' ? pendingData : historyData;
  const filteredData = applyFilters(baseData);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredData.map(d => d.orderId));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const toggleSelect = (orderId) => {
    setSelectedOrderIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  const openConfirm = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleConfirmAssemble = () => {
    if (!selectedOrder) return;
    processConfirmation([selectedOrder.orderId]);
    setModalOpen(false);
  };

  const handleBulkConfirm = () => {
    processConfirmation(selectedOrderIds);
    setBulkModalOpen(false);
    setSelectedOrderIds([]);
  };

  const processConfirmation = (ids) => {
    // 1. Update Assemble status to Assembled
    const assembledOrders = data.filter(d => ids.includes(d.orderId));
    const updatedAssemble = data.map(d => ids.includes(d.orderId) ? { ...d, status: 'Assembled', assembledAt: new Date().toISOString() } : d);
    
    setData(updatedAssemble);
    save('jp_assembles', updatedAssemble);

    // 2. Move to Invoices
    const currentInvoices = get('jp_invoices') || [];
    const newInvoices = assembledOrders.map(order => ({
      ...order,
      status: 'Pending',
      readyForInvoiceDate: new Date().toISOString()
    }));
    
    save('jp_invoices', [...currentInvoices, ...newInvoices]);
    window.dispatchEvent(new Event("storage"));
  };

  const formatItems = (items) => {
    if (!items || items.length === 0) return '-';
    return items.map(i => `${i.name} (${i.qty})`).join(', ');
  };

  const columns = [
    <input type="checkbox" className="rounded border-gray-300" onChange={toggleSelectAll} checked={selectedOrderIds.length === filteredData.length && filteredData.length > 0} />,
    'Action', 'Order ID', 'Enquiry ID', 'Customer Name', 'Items', 'Qty', 'Priority', 'Source'
  ];
  const historyColumns = ['Order ID', 'Enquiry ID', 'Customer', 'Items', 'Qty', 'Source', 'Priority', 'Assembled Date', 'Status'];

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          {activeTab === 'pending' && (
            <input type="checkbox" className="mt-1 rounded border-gray-300" checked={selectedOrderIds.includes(item.orderId)} onChange={() => toggleSelect(item.orderId)} />
          )}
          <div>
            <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
            <p className="text-sm text-gray-600">{item.personName}</p>
          </div>
        </div>
        <StatusBadge status={item.priority} />
      </div>
      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Items to Assemble</p>
        <p className="text-sm text-gray-700">{formatItems(item.items)}</p>
      </div>
      {activeTab === 'pending' && (
        <button onClick={() => openConfirm(item)} className="btn btn-primary w-full py-2 flex items-center justify-center gap-2 text-xs">
          <CheckCircle size={14} /> Complete Assembly
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-1 sm:p-2 mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Assembly Stage</h2>
          {selectedOrderIds.length > 0 && (
            <button 
              onClick={() => setBulkModalOpen(true)}
              className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-sky-700 transition-all shadow-sm animate-in fade-in slide-in-from-left-2"
            >
              <ListChecks size={16} /> Confirm Selection ({selectedOrderIds.length})
            </button>
          )}
        </div>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search Order ID, Customer, Items…"
          filters={[
            { label: 'All Priorities', value: filterPriority, onChange: setFilterPriority, options: [{label:'High', value:'High'}, {label:'Medium', value:'Medium'}, {label:'Low', value:'Low'}] }
          ]}
          count={{ filtered: filteredData.length, total: baseData.length }}
        />

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0 overflow-x-auto w-full xl:w-auto">
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('pending'); setSearch(''); setSelectedOrderIds([]); }}>
            To Assemble ({pendingData.length})
          </button>
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('history'); setSearch(''); setSelectedOrderIds([]); }}>
            History
          </button>
        </div>
      </div>

      <DataTable
        columns={activeTab === 'pending' ? columns : historyColumns}
        data={filteredData}
        renderRow={(item, idx) => (
          <tr key={idx} className={`hover:bg-gray-50 transition-colors ${selectedOrderIds.includes(item.orderId) ? 'bg-sky-50/50' : ''}`}>
            {activeTab === 'pending' ? (
              <>
                <td><input type="checkbox" className="rounded border-gray-300" checked={selectedOrderIds.includes(item.orderId)} onChange={() => toggleSelect(item.orderId)} /></td>
                <td>
                  <button onClick={() => openConfirm(item)} className="text-sky-600 hover:text-sky-800 text-sm font-semibold flex items-center gap-1">
                    <CheckCircle size={15} /> Confirm
                  </button>
                </td>
                <td className="font-medium text-gray-900">{item.orderId || '-'}</td>
                <td className="text-xs text-gray-500">{item.enquiryId || 'N/A'}</td>
                <td>{item.personName || 'Unnamed'}</td>
                <td className="max-w-[300px] truncate">{formatItems(item.items)}</td>
                <td className="font-bold text-sky-600">{item.items?.reduce((sum, i) => sum + Number(i.qty), 0) || 0}</td>
                <td><StatusBadge status={item.priority || 'Medium'} /></td>
                <td>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    {item.source === 'Purchase' ? <Clock size={14} className="text-orange-400" /> : <Package size={14} className="text-green-400" />}
                    {item.source || 'Stock Check'}
                  </span>
                </td>
              </>
            ) : (
              <>
                <td className="font-medium text-gray-900">{item.orderId || '-'}</td>
                <td className="text-xs text-gray-500">{item.enquiryId || 'N/A'}</td>
                <td>{item.personName || 'Unnamed'}</td>
                <td className="max-w-[300px] truncate">{formatItems(item.items)}</td>
                <td className="font-bold text-sky-600">{item.items?.reduce((sum, i) => sum + Number(i.qty), 0) || 0}</td>
                <td>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    {item.source === 'Purchase' ? <Clock size={14} className="text-orange-400" /> : <Package size={14} className="text-green-400" />}
                    {item.source || 'Stock Check'}
                  </span>
                </td>
                <td><StatusBadge status={item.priority || 'Medium'} /></td>
                <td className="text-xs text-gray-500">{item.assembledAt ? new Date(item.assembledAt).toLocaleDateString() : '-'}</td>
                <td><StatusBadge status="Assembled" /></td>
              </>
            )}
          </tr>
        )}
        renderCard={renderCard}
      />

      {/* Individual Confirmation Modal */}
      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Final Assembly Confirmation">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
              <div className="flex items-center gap-2 text-sky-700 font-bold mb-2">
                <Package size={20} />
                <span>Order {selectedOrder.orderId}</span>
              </div>
              <p className="text-sm text-sky-600">Please confirm that all items listed below have been physically assembled and checked for quality.</p>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase">Item Checklist</label>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-sky-500 flex items-center justify-center bg-sky-500 text-white">
                        <CheckCircle size={14} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-sky-600">Qty: {item.qty}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleConfirmAssemble} className="btn btn-primary w-full py-3 text-base shadow-lg shadow-sky-100 mt-2">
              All Items Checked - Move to Invoicing
            </button>
          </div>
        )}
      </PopupModal>

      {/* Bulk Confirmation Modal */}
      <PopupModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Assembly Confirmation">
        <div className="space-y-4">
          <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-start gap-3">
            <ListChecks size={24} className="text-sky-600 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-sky-800">Confirming {selectedOrderIds.length} Orders</p>
              <p className="text-sm text-sky-600">You are about to mark all items in these orders as "Assembled" and move them to the Invoicing stage.</p>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar border rounded-lg divide-y">
            {data.filter(d => selectedOrderIds.includes(d.orderId)).map(order => (
              <div key={order.orderId} className="p-3 flex justify-between items-center bg-white">
                <div>
                  <p className="text-xs font-bold text-gray-400">{order.orderId}</p>
                  <p className="text-sm font-medium text-gray-900">{order.personName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Items: {order.items?.length || 0}</p>
                  <StatusBadge status={order.priority} />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <button onClick={handleBulkConfirm} className="btn btn-primary w-full py-3 text-base shadow-lg shadow-sky-100">
              Confirm All Selected Orders
            </button>
          </div>
        </div>
      </PopupModal>
    </div>
  );
};

export default Assemble;
