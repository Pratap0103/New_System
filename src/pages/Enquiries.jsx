import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import ImageViewer from '../components/ImageViewer';
import { Search, Image as ImageIcon } from 'lucide-react';

const Enquiries = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  
  const [formData, setFormData] = useState({ status: 'Follow Up', nextDate: '', remarks: '' });

  useEffect(() => {
    setData(get('jp_enquiries'));
  }, []);

  const pendingData = data.filter(d => !['Order Received', 'Order Cancelled'].includes(d.status));
  const historyData = data.filter(d => ['Order Received', 'Order Cancelled'].includes(d.status) || d.status === 'Follow Up');

  const openFollowUp = (item) => {
    setSelectedEnquiry(item);
    setFormData({ status: 'Follow Up', nextDate: '', remarks: '' });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (formData.status === 'Follow Up' && !formData.nextDate) return alert("Next date required for Follow Up.");

    const updated = data.map(d => d.orderId === selectedEnquiry.orderId ? {
      ...d, status: formData.status, nextDate: formData.nextDate, remarks: formData.remarks
    } : d);

    // If "Order Received", inject into jp_orders strictly
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
    
    // Auto-refresh layout to recalculate badges (by reloading or state management, doing minimal window.dispatchEvent or reload for simplicity here)
    window.dispatchEvent(new Event("storage"));
  };

  const columnsPending = ['Order ID', 'Person Name', 'Number', 'Item Name', 'Qty', 'Image', 'Order Date', 'Action'];
  const columnsHistory = ['Order ID', 'Person Name', 'Number', 'Item Name', 'Qty', 'Image', 'Order Date', 'Status', 'Next Date', 'Remarks'];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Enquiries</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('pending')}>
            Pending Action ({pendingData.length})
          </button>
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('history')}>
            History
          </button>
        </div>
      </div>

      <DataTable 
        columns={activeTab === 'pending' ? columnsPending : columnsHistory}
        data={activeTab === 'pending' ? pendingData : historyData}
        renderRow={(item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 transition-colors">
            <td className="font-medium text-gray-900">{item.orderId}</td>
            <td>{item.personName}</td>
            <td>{item.personNumber}</td>
            <td>{item.itemName}</td>
            <td>{item.quantity}</td>
            <td>
              <button className="text-indigo-600 p-1 bg-indigo-50 rounded" onClick={() => setImageModal({ open: true, url: item.itemImage })}>
                <ImageIcon size={16} />
              </button>
            </td>
            <td>{new Date(item.orderDate).toLocaleDateString()}</td>
            {activeTab === 'pending' ? (
              <td>
                <button onClick={() => openFollowUp(item)} className="btn btn-primary px-3 py-1 text-xs">Follow Up</button>
              </td>
            ) : (
              <>
                <td><StatusBadge status={item.status} /></td>
                <td>{item.nextDate || '-'}</td>
                <td className="max-w-[150px] truncate" title={item.remarks}>{item.remarks || '-'}</td>
              </>
            )}
          </tr>
        )}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Follow Up Action">
        {selectedEnquiry && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
               <div className="pb-2 flex justify-between"><span><strong>Name:</strong> {selectedEnquiry.personName}</span> <span>{selectedEnquiry.personNumber}</span></div>
               <div className="pt-2 flex justify-between"><span><strong>Item:</strong> {selectedEnquiry.itemName}</span> <span>Qty: {selectedEnquiry.quantity}</span></div>
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
              <label className="input-label">Remarks {formData.status !== 'Follow Up' && '(Optional)'}</label>
              <textarea rows="2" className="input-field" placeholder="Notes..." value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
            </div>

            <div className="pt-2">
              <button onClick={handleSubmit} className="btn btn-primary w-full py-2.5">Save & Continue</button>
            </div>
          </div>
        )}
      </PopupModal>
      
      <ImageViewer isOpen={imageModal.open} onClose={() => setImageModal({ open: false, url: '' })} />
    </div>
  );
};

export default Enquiries;
