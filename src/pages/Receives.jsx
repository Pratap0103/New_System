import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import SearchBar from '../components/SearchBar';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Receives = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ receivedQty: '', receivedDate: '', condition: 'Good', receivedBy: '', remarks: '' });

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterItem, setFilterItem] = useState('');

  useEffect(() => {
    setData(get('jp_receives'));
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Received');

  const itemNames = [...new Set(data.map(item => item.itemName))].filter(Boolean).map(i => ({ label: i, value: i }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.orderId, q) || match(d.itemName, q) || match(d.supplierName, q);
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchItem = !filterItem || d.itemName === filterItem;
      return matchSearch && matchStatus && matchItem;
    });
  };

  const baseData = activeTab === 'pending' ? pendingData : historyData;
  const filteredData = applyFilters(baseData);

  const openReceive = (item) => {
    setSelectedItem(item);
    setFormData({ receivedQty: item.quantity, receivedDate: new Date().toISOString().split('T')[0], condition: 'Good', receivedBy: '', remarks: '' });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.receivedQty || !formData.receivedBy) return alert("Received Qty and Received By required.");
    const updated = data.map(d => d.orderId === selectedItem.orderId ? {
      ...d,
      status: 'Received',
      receivedQty: Number(formData.receivedQty),
      receivedDate: formData.receivedDate,
      condition: formData.condition,
      receivedBy: formData.receivedBy,
      remarks: formData.remarks
    } : d);

    const inventory = get('jp_inventory');
    const updatedInventory = inventory.map(inv => inv.productName.includes(selectedItem.itemName) || selectedItem.itemName.includes(inv.productName) ? {
      ...inv, availableStock: Number(inv.availableStock) + Number(formData.receivedQty)
    } : inv);
    save('jp_inventory', updatedInventory);

    const invoices = get('jp_invoices');
    save('jp_invoices', [...invoices, {
      orderId: selectedItem.orderId,
      customerName: 'Customer (From Purchase)',
      item: selectedItem.itemName,
      quantity: Number(formData.receivedQty),
      status: 'Pending'
    }]);

    setData(updated);
    save('jp_receives', updated);
    setModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const columnsPending = ['Order ID', 'Item Name', 'Qty Expected', 'Supplier Name', 'Target Delivery', 'Status', 'Action'];
  const columnsHistory = ['Order ID', 'Item Name', 'Received Qty', 'Received Date', 'Condition', 'Received By', 'Status'];

  const renderPendingCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{item.itemName}</p>
          <p className="text-xs text-gray-500">Supplier: {item.supplierName}</p>
        </div>
        <StatusBadge status="PendingReceive" />
      </div>
      <div className="flex justify-between items-center border-t border-gray-100 pt-2">
        <div className="text-xs text-gray-500">
          <span>Qty: <strong className="text-gray-800">{item.quantity}</strong></span>
          <span className="ml-3">Due: {new Date(item.expectedDeliveryDate).toLocaleDateString()}</span>
        </div>
        <button onClick={() => openReceive(item)} className="btn btn-primary px-3 py-1.5 text-xs">Receive</button>
      </div>
    </div>
  );

  const renderHistoryCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
          <p className="text-sm font-medium text-gray-700">{item.itemName}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
        <div><span className="font-medium text-gray-700">Received Qty:</span> <span className="font-bold text-green-600">{item.receivedQty}</span></div>
        <div><span className="font-medium text-gray-700">Date:</span> {new Date(item.receivedDate).toLocaleDateString()}</div>
        <div><span className="font-medium text-gray-700">Condition:</span> <span className={item.condition === 'Good' ? 'text-green-600' : 'text-red-600'}>{item.condition}</span></div>
        <div><span className="font-medium text-gray-700">By:</span> {item.receivedBy}</div>
      </div>
    </div>
  );

  const statusOptions = activeTab === 'pending'
    ? [{ label: 'Pending', value: 'Pending' }]
    : [{ label: 'Received', value: 'Received' }];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Receives</h2>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search Order ID, Item, Supplier…"
          filters={[
            { label: 'All Items', value: filterItem, onChange: setFilterItem, options: itemNames },
            { label: 'All Status', value: filterStatus, onChange: setFilterStatus, options: statusOptions }
          ]}
          count={{ filtered: filteredData.length, total: baseData.length }}
        />

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0 overflow-x-auto w-full xl:w-auto">
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('pending'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
            Incoming ({pendingData.length})
          </button>
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('history'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
            History
          </button>
        </div>
      </div>

      <DataTable
        columns={activeTab === 'pending' ? columnsPending : columnsHistory}
        data={filteredData}
        renderRow={(item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 transition-colors">
            <td className="font-medium text-gray-900">{item.orderId}</td>
            <td>{item.itemName}</td>
            {activeTab === 'pending' ? (
              <>
                <td className="font-bold">{item.quantity}</td>
                <td>{item.supplierName}</td>
                <td>{new Date(item.expectedDeliveryDate).toLocaleDateString()}</td>
                <td><StatusBadge status="PendingReceive" /></td>
                <td><button onClick={() => openReceive(item)} className="btn btn-primary px-3 py-1 text-xs">Receive</button></td>
              </>
            ) : (
              <>
                <td className="font-bold text-green-600">{item.receivedQty}</td>
                <td>{new Date(item.receivedDate).toLocaleDateString()}</td>
                <td><span className={`px-2 py-1 rounded text-xs ${item.condition === 'Good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.condition}</span></td>
                <td>{item.receivedBy}</td>
                <td><StatusBadge status={item.status} /></td>
              </>
            )}
          </tr>
        )}
        renderCard={activeTab === 'pending' ? renderPendingCard : renderHistoryCard}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Stock Receipt">
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
              <div className="pb-2 flex justify-between"><span><strong>Supplier:</strong> {selectedItem.supplierName}</span></div>
              <div className="pt-2 flex justify-between"><span><strong>Item:</strong> {selectedItem.itemName}</span> <span>Expected Qty: {selectedItem.quantity}</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="input-label">Actual Received Qty <span className="text-red-500">*</span></label><input type="number" className="input-field" value={formData.receivedQty} onChange={e => setFormData({...formData, receivedQty: e.target.value})} /></div>
              <div><label className="input-label">Received Date</label><input type="date" className="input-field" disabled value={formData.receivedDate} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Condition</label>
                <select className="input-field" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                  <option value="Good">Good / Perfect</option>
                  <option value="Damaged">Damaged (Requires Action)</option>
                </select>
              </div>
              <div><label className="input-label">Received By (Staff Name) <span className="text-red-500">*</span></label><input className="input-field" value={formData.receivedBy} onChange={e => setFormData({...formData, receivedBy: e.target.value})} /></div>
            </div>
            <div><label className="input-label">Remarks / Exceptions</label><textarea rows="2" className="input-field" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} /></div>
            <div className="pt-2">
              <button onClick={handleSubmit} className="btn btn-primary w-full py-2.5">Confirm & Auto-Update Inventory System</button>
            </div>
          </div>
        )}
      </PopupModal>
    </div>
  );
};

export default Receives;
