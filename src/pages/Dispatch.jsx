import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import SearchBar from '../components/SearchBar';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Dispatch = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    deliveryAddress: '', transportName: '', vehicleNumber: '', driverContact: '',
    dispatchDate: '', estimatedDeliveryDate: '', notes: ''
  });

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterItem, setFilterItem] = useState('');

  useEffect(() => {
    setData(get('jp_dispatches'));
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Dispatched');

  const itemNames = [...new Set(data.map(item => item.itemName))].filter(Boolean).map(i => ({ label: i, value: i }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.invoiceId, q) || match(d.orderId, q) || match(d.personName, q) || match(d.itemName, q) || match(d.transportName, q);
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchItem = !filterItem || d.itemName === filterItem;
      return matchSearch && matchStatus && matchItem;
    });
  };

  const baseData = activeTab === 'pending' ? pendingData : historyData;
  const filteredData = applyFilters(baseData);

  const openDispatch = (item) => {
    setSelectedItem(item);
    setFormData({
      deliveryAddress: '', transportName: '', vehicleNumber: '', driverContact: '',
      dispatchDate: new Date().toISOString().split('T')[0], estimatedDeliveryDate: '', notes: ''
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.transportName || !formData.dispatchDate) return alert("Transport setup required.");
    const dispatchId = generateId('DIS');
    const updated = data.map(d => d.invoiceId === selectedItem.invoiceId ? {
      ...d,
      status: 'Dispatched',
      dispatchId,
      deliveryAddress: formData.deliveryAddress,
      transportName: formData.transportName,
      vehicleNumber: formData.vehicleNumber,
      driverContact: formData.driverContact,
      dispatchDate: formData.dispatchDate,
      estimatedDeliveryDate: formData.estimatedDeliveryDate,
      notes: formData.notes
    } : d);

    const inventory = get('jp_inventory');
    const updatedInventory = inventory.map(inv => inv.productName.includes(selectedItem.itemName) || selectedItem.itemName.includes(inv.productName) ? {
      ...inv, availableStock: Math.max(0, Number(inv.availableStock) - Number(selectedItem.quantity))
    } : inv);
    save('jp_inventory', updatedInventory);

    setData(updated);
    save('jp_dispatches', updated);
    setModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const columnsPending = ['Invoice ID', 'Order Ref', 'Customer', 'Item', 'Qty', 'Total Amount', 'Action'];
  const columnsHistory = ['Dispatch ID', 'Invoice ID', 'Customer', 'Item', 'Transport', 'Vehicle No', 'Dispatch Date', 'Est Delivery', 'Status'];

  const renderPendingCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-sky-700">{item.invoiceId}</p>
          <p className="text-xs text-gray-500">{item.orderId}</p>
          <p className="text-sm font-medium text-gray-800 mt-1">{item.personName}</p>
          <p className="text-sm text-gray-600">{item.itemName} × {item.quantity}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">₹{item.totalAmount}</p>
        </div>
      </div>
      <button onClick={() => openDispatch(item)} className="btn btn-primary w-full py-2 text-xs">Dispatch</button>
    </div>
  );

  const renderHistoryCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-gray-900">{item.dispatchId}</p>
          <p className="text-xs text-gray-500">{item.invoiceId}</p>
          <p className="text-sm font-medium text-gray-700 mt-1">{item.personName}</p>
          <p className="text-sm text-gray-600">{item.itemName}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
        <div><span className="font-medium text-gray-700">Transport:</span> {item.transportName}</div>
        <div><span className="font-medium text-gray-700">Vehicle:</span> {item.vehicleNumber}</div>
        <div><span className="font-medium text-gray-700">Dispatched:</span> {new Date(item.dispatchDate).toLocaleDateString()}</div>
        <div><span className="font-medium text-gray-700">ETA:</span> {item.estimatedDeliveryDate ? new Date(item.estimatedDeliveryDate).toLocaleDateString() : '-'}</div>
      </div>
    </div>
  );

  const statusOptions = activeTab === 'pending'
    ? [{ label: 'Pending', value: 'Pending' }]
    : [{ label: 'Dispatched', value: 'Dispatched' }];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Dispatch Operations</h2>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search Invoice ID, Order Ref, Customer, Item, Transport…"
          filters={[
            { label: 'All Items', value: filterItem, onChange: setFilterItem, options: itemNames },
            { label: 'All Status', value: filterStatus, onChange: setFilterStatus, options: statusOptions }
          ]}
          count={{ filtered: filteredData.length, total: baseData.length }}
        />

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0 overflow-x-auto w-full xl:w-auto">
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('pending'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
            Loading ({pendingData.length})
          </button>
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('history'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
            Dispatched
          </button>
        </div>
      </div>

      <DataTable
        columns={activeTab === 'pending' ? columnsPending : columnsHistory}
        data={filteredData}
        renderRow={(item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 transition-colors">
            {activeTab === 'pending' ? (
              <>
                <td className="font-medium text-gray-900">{item.invoiceId}</td>
                <td className="text-xs text-gray-500">{item.orderId}</td>
                <td>{item.personName}</td>
                <td>{item.itemName}</td>
                <td className="font-bold">{item.quantity}</td>
                <td>₹{item.totalAmount}</td>
                <td><button onClick={() => openDispatch(item)} className="btn btn-primary px-3 py-1 text-xs">Dispatch</button></td>
              </>
            ) : (
              <>
                <td className="font-medium text-gray-900">{item.dispatchId}</td>
                <td className="text-xs text-gray-500">{item.invoiceId}</td>
                <td>{item.personName}</td>
                <td>{item.itemName}</td>
                <td>{item.transportName}</td>
                <td>{item.vehicleNumber}</td>
                <td>{new Date(item.dispatchDate).toLocaleDateString()}</td>
                <td>{item.estimatedDeliveryDate ? new Date(item.estimatedDeliveryDate).toLocaleDateString() : '-'}</td>
                <td><StatusBadge status={item.status} /></td>
              </>
            )}
          </tr>
        )}
        renderCard={activeTab === 'pending' ? renderPendingCard : renderHistoryCard}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Finalize Dispatch Order">
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
              <div className="pb-2 flex justify-between"><span><strong>Invoice:</strong> {selectedItem.invoiceId}</span></div>
              <div className="pt-2 flex justify-between"><span><strong>Destination:</strong> {selectedItem.personName}</span> <span>{selectedItem.itemName} (x{selectedItem.quantity})</span></div>
            </div>
            <div><label className="input-label">Delivery Address</label><textarea rows="2" className="input-field" value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="input-label">Transport Name / Courier <span className="text-red-500">*</span></label><input className="input-field" value={formData.transportName} onChange={e => setFormData({...formData, transportName: e.target.value})} /></div>
              <div><label className="input-label">Vehicle / Tracking Number</label><input className="input-field" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="input-label">Dispatch Date <span className="text-red-500">*</span></label><input type="date" className="input-field" value={formData.dispatchDate} onChange={e => setFormData({...formData, dispatchDate: e.target.value})} /></div>
              <div><label className="input-label">Est. Delivery Date</label><input type="date" className="input-field" value={formData.estimatedDeliveryDate} onChange={e => setFormData({...formData, estimatedDeliveryDate: e.target.value})} /></div>
            </div>
            <div><label className="input-label">Driver Contact / Notes</label><input className="input-field" value={formData.driverContact} onChange={e => setFormData({...formData, driverContact: e.target.value})} /></div>
            <div className="pt-2">
              <button onClick={handleSubmit} className="btn btn-primary w-full py-2.5">Mark Dispatched & Deduct Stock</button>
            </div>
          </div>
        )}
      </PopupModal>
    </div>
  );
};

export default Dispatch;
