import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import ImageViewer from '../components/ImageViewer';
import SearchBar from '../components/SearchBar';
import { Image as ImageIcon } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Purchases = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ supplierName: '', supplierContact: '', purchasePrice: '', expectedDeliveryDate: '', notes: '' });

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterItem, setFilterItem] = useState('');

  useEffect(() => {
    setData(get('jp_purchases'));
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Purchased');

  const itemNames = [...new Set(data.map(item => item.itemName))].filter(Boolean).map(i => ({ label: i, value: i }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.orderId, q) || match(d.personName, q) || match(d.itemName, q) || match(d.supplierName, q);
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchItem = !filterItem || d.itemName === filterItem;
      return matchSearch && matchStatus && matchItem;
    });
  };

  const baseData = activeTab === 'pending' ? pendingData : historyData;
  const filteredData = applyFilters(baseData);

  const openPurchase = (item) => {
    setSelectedItem(item);
    setFormData({ supplierName: '', supplierContact: '', purchasePrice: '', expectedDeliveryDate: '', notes: '' });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.supplierName || !formData.expectedDeliveryDate) return alert("Supplier and Date required.");
    const updated = data.map(d => d.orderId === selectedItem.orderId ? {
      ...d,
      status: 'Purchased',
      supplierName: formData.supplierName,
      supplierContact: formData.supplierContact,
      purchasePrice: Number(formData.purchasePrice),
      expectedDeliveryDate: formData.expectedDeliveryDate,
      notes: formData.notes
    } : d);

    const receives = get('jp_receives');
    save('jp_receives', [...receives, {
      orderId: selectedItem.orderId,
      itemName: selectedItem.itemName,
      quantity: selectedItem.quantity,
      supplierName: formData.supplierName,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      status: 'Pending'
    }]);

    setData(updated);
    save('jp_purchases', updated);
    setModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const columnsPending = ['Order ID', 'Person Name', 'Item Name', 'Qty', 'Image', 'Order Date', 'Action'];
  const columnsHistory = ['Order ID', 'Item Name', 'Qty', 'Supplier Name', 'Contact', 'Price', 'Exp Delivery', 'Status'];

  const renderPendingCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{item.personName}</p>
        </div>
        <button className="text-sky-600 p-2 bg-sky-50 rounded-lg" onClick={() => setImageModal({ open: true, url: item.itemImage })}>
          <ImageIcon size={16} />
        </button>
      </div>
      <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-2">
        <div>
          <p className="text-gray-800 font-medium">{item.itemName}</p>
          <p className="text-xs text-gray-500">Qty: {item.quantity} · {new Date(item.orderDate).toLocaleDateString()}</p>
        </div>
        <button onClick={() => openPurchase(item)} className="btn btn-primary px-3 py-1.5 text-xs">Purchase</button>
      </div>
    </div>
  );

  const renderHistoryCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
          <p className="text-sm text-gray-700 font-medium">{item.itemName}</p>
          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div><span className="font-medium text-gray-700">Supplier:</span> {item.supplierName}</div>
        <div><span className="font-medium text-gray-700">Price:</span> ₹{item.purchasePrice}</div>
        <div><span className="font-medium text-gray-700">Contact:</span> {item.supplierContact || '-'}</div>
        <div><span className="font-medium text-gray-700">Delivery:</span> {new Date(item.expectedDeliveryDate).toLocaleDateString()}</div>
      </div>
    </div>
  );

  const statusOptions = activeTab === 'pending'
    ? [{ label: 'Pending', value: 'Pending' }]
    : [{ label: 'Purchased', value: 'Purchased' }];

  return (
    <div className="animate-fade-in space-y-4">
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-1 sm:p-2 mb-2">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Purchases</h2>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search Order ID, Name, Supplier…"
          filters={[
            { label: 'All Items', value: filterItem, onChange: setFilterItem, options: itemNames },
            { label: 'All Status', value: filterStatus, onChange: setFilterStatus, options: statusOptions }
          ]}
          count={{ filtered: filteredData.length, total: baseData.length }}
        />

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0 overflow-x-auto w-full xl:w-auto">
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('pending'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
            To Purchase ({pendingData.length})
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
            <td className="font-medium text-gray-900">{item.orderId || '-'}</td>
            {activeTab === 'pending' && <td>{item.personName || 'Unnamed'}</td>}
            <td>{item.itemName || 'No Item'}</td>
            <td>{item.quantity || 0}</td>
            {activeTab === 'pending' ? (
              <>
                <td>
                  <button className="text-sky-600 p-1 bg-sky-50 rounded" onClick={() => setImageModal({ open: true, url: item.itemImage })}>
                    <ImageIcon size={16} />
                  </button>
                </td>
                <td>{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : '-'}</td>
                <td><button onClick={() => openPurchase(item)} className="btn btn-primary px-3 py-1 text-xs">Purchase</button></td>
              </>
            ) : (
              <>
                <td>{item.supplierName || '-'}</td>
                <td>{item.supplierContact || '-'}</td>
                <td>₹{item.purchasePrice || 0}</td>
                <td>{item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toLocaleDateString() : '-'}</td>
                <td><StatusBadge status={item.status || 'Pending'} /></td>
              </>
            )}
          </tr>
        )}
        renderCard={activeTab === 'pending' ? renderPendingCard : renderHistoryCard}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Place Purchase Order">
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
              <div className="pb-2"><strong>Ref Order:</strong> {selectedItem.orderId}</div>
              <div className="pt-2 flex justify-between"><span><strong>Item:</strong> {selectedItem.itemName}</span> <span>Qty: {selectedItem.quantity}</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="input-label">Supplier Name <span className="text-red-500">*</span></label><input className="input-field" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} /></div>
              <div><label className="input-label">Supplier Contact</label><input className="input-field" value={formData.supplierContact} onChange={e => setFormData({...formData, supplierContact: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="input-label">Purchase Price (₹)</label><input type="number" className="input-field" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} /></div>
              <div><label className="input-label">Expected Delivery <span className="text-red-500">*</span></label><input type="date" className="input-field" value={formData.expectedDeliveryDate} onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})} /></div>
            </div>
            <div><label className="input-label">Notes</label><textarea rows="2" className="input-field" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
            <div className="pt-2">
              <button onClick={handleSubmit} className="btn btn-primary w-full py-2.5">Confirm Purchase Route</button>
            </div>
          </div>
        )}
      </PopupModal>

      <ImageViewer isOpen={imageModal.open} onClose={() => setImageModal({ open: false, url: '' })} />
    </div>
  );
};

export default Purchases;
