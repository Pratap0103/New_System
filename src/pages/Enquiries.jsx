import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import ImageViewer from '../components/ImageViewer';
import SearchBar from '../components/SearchBar';
import { Image as ImageIcon } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Enquiries = () => {
  const [data, setData]             = useState([]);
  const [activeTab, setActiveTab]   = useState('pending');
  const [modalOpen, setModalOpen]   = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [formData, setFormData]     = useState({ status: 'Follow Up', nextDate: '', remarks: '' });

  // Search & filter state
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterItem, setFilterItem]     = useState('');

  useEffect(() => { setData(get('jp_enquiries')); }, []);

  const pendingData  = data.filter(d => !['Order Received', 'Order Cancelled'].includes(d.status));
  const historyData  = data.filter(d => ['Order Received', 'Order Cancelled', 'Follow Up'].includes(d.status));

  const itemNames = [...new Set(data.map(item => item.itemName))].filter(Boolean).map(i => ({ label: i, value: i }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.orderId, q) || match(d.personName, q) || match(d.personNumber, q) || match(d.itemName, q);
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchItem = !filterItem || d.itemName === filterItem;
      return matchSearch && matchStatus && matchItem;
    });
  };

  const baseData     = activeTab === 'pending' ? pendingData : historyData;
  const filteredData = applyFilters(baseData);

  const openFollowUp = (item) => {
    setSelectedEnquiry(item);
    setFormData({ status: 'Follow Up', nextDate: '', remarks: '' });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (formData.status === 'Follow Up' && !formData.nextDate) return alert('Next date required for Follow Up.');
    const updated = data.map(d => d.orderId === selectedEnquiry.orderId
      ? { ...d, status: formData.status, nextDate: formData.nextDate, remarks: formData.remarks }
      : d);
    if (formData.status === 'Order Received') {
      const orders = get('jp_orders');
      if (!orders.find(o => o.orderId === selectedEnquiry.orderId)) {
        save('jp_orders', [...orders, {
          orderId: selectedEnquiry.orderId,
          personName: selectedEnquiry.personName,
          personNumber: selectedEnquiry.personNumber,
          itemName: selectedEnquiry.itemName,
          quantity: selectedEnquiry.quantity,
          itemImage: selectedEnquiry.itemImage,
          orderDate: selectedEnquiry.orderDate,
          status: 'Pending'
        }]);
      }
    }
    setData(updated);
    save('jp_enquiries', updated);
    setModalOpen(false);
    window.dispatchEvent(new Event('storage'));
  };

  const columnsPending = ['Order ID', 'Person Name', 'Number', 'Item Name', 'Qty', 'Image', 'Order Date', 'Action'];
  const columnsHistory = ['Order ID', 'Person Name', 'Item Name', 'Qty', 'Order Date', 'Status', 'Next Date', 'Remarks'];

  const renderPendingCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{item.personName}</p>
          <p className="text-xs text-gray-500">{item.personNumber}</p>
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
        <button onClick={() => openFollowUp(item)} className="btn btn-primary px-3 py-1.5 text-xs">Follow Up</button>
      </div>
    </div>
  );

  const renderHistoryCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
          <p className="text-sm text-gray-700">{item.personName}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{item.itemName} · Qty: {item.quantity}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
        <span>Date: {new Date(item.orderDate).toLocaleDateString()}</span>
        <span>Next: {item.nextDate || '-'}</span>
      </div>
      {item.remarks && <p className="text-xs text-gray-500 italic truncate">{item.remarks}</p>}
    </div>
  );

  const statusOptions = activeTab === 'pending'
    ? [{ label: 'New', value: 'New' }, { label: 'Follow Up', value: 'Follow Up' }]
    : [{ label: 'Follow Up', value: 'Follow Up' }, { label: 'Order Received', value: 'Order Received' }, { label: 'Order Cancelled', value: 'Order Cancelled' }];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Enquiries</h2>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search Order ID, Name, Number…"
          filters={[
            { label: 'All Items', value: filterItem, onChange: setFilterItem, options: itemNames },
            { label: 'All Status', value: filterStatus, onChange: setFilterStatus, options: statusOptions }
          ]}
          count={{ filtered: filteredData.length, total: baseData.length }}
        />

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0 overflow-x-auto w-full xl:w-auto">
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`}
            onClick={() => { setActiveTab('pending'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
            Pending ({pendingData.length})
          </button>
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`}
            onClick={() => { setActiveTab('history'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
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
            <td>{item.personName}</td>
            <td>{item.personNumber}</td>
            <td>{item.itemName}</td>
            <td>{item.quantity}</td>
            <td>
              <button className="text-sky-600 p-1 bg-sky-50 rounded" onClick={() => setImageModal({ open: true, url: item.itemImage })}>
                <ImageIcon size={16} />
              </button>
            </td>
            <td>{new Date(item.orderDate).toLocaleDateString()}</td>
            {activeTab === 'pending' ? (
              <td><button onClick={() => openFollowUp(item)} className="btn btn-primary px-3 py-1 text-xs">Follow Up</button></td>
            ) : (
              <>
                <td><StatusBadge status={item.status} /></td>
                <td>{item.nextDate || '-'}</td>
                <td className="max-w-[150px] truncate" title={item.remarks}>{item.remarks || '-'}</td>
              </>
            )}
          </tr>
        )}
        renderCard={activeTab === 'pending' ? renderPendingCard : renderHistoryCard}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Follow Up Action">
        {selectedEnquiry && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
              <div className="pb-2 flex justify-between"><span><strong>Name:</strong> {selectedEnquiry.personName}</span><span className="text-gray-500">{selectedEnquiry.personNumber}</span></div>
              <div className="pt-2 flex justify-between"><span><strong>Item:</strong> {selectedEnquiry.itemName}</span><span className="text-gray-500">Qty: {selectedEnquiry.quantity}</span></div>
            </div>
            <div>
              <label className="input-label">Action Status</label>
              <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Follow Up">Follow Up</option>
                <option value="Order Received">Order Received (Move to Orders)</option>
                <option value="Order Cancelled">Order Cancelled</option>
              </select>
            </div>
            {formData.status === 'Follow Up' && (
              <div>
                <label className="input-label">Next Follow-Up Date <span className="text-red-500">*</span></label>
                <input type="date" className="input-field" value={formData.nextDate} onChange={e => setFormData({ ...formData, nextDate: e.target.value })} />
              </div>
            )}
            <div>
              <label className="input-label">Remarks</label>
              <textarea rows="2" className="input-field" placeholder="Notes…" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
            </div>
            <button onClick={handleSubmit} className="btn btn-primary w-full py-2.5">Save & Continue</button>
          </div>
        )}
      </PopupModal>
      <ImageViewer isOpen={imageModal.open} onClose={() => setImageModal({ open: false, url: '' })} />
    </div>
  );
};

export default Enquiries;
