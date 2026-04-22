import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import ImageViewer from '../components/ImageViewer';
import { Image as ImageIcon } from 'lucide-react';

const Purchases = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [formData, setFormData] = useState({ supplierName: '', supplierContact: '', purchasePrice: '', expectedDeliveryDate: '', notes: '' });

  useEffect(() => {
    setData(get('jp_purchases'));
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Purchased');

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

    // Push to Receives
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

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Purchases</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('pending')}>
            To Purchase ({pendingData.length})
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
            {activeTab === 'pending' && <td>{item.personName}</td>}
            <td>{item.itemName}</td>
            <td>{item.quantity}</td>
            
            {activeTab === 'pending' ? (
              <>
                <td>
                  <button className="text-indigo-600 p-1 bg-indigo-50 rounded" onClick={() => setImageModal({ open: true, url: item.itemImage })}>
                    <ImageIcon size={16} />
                  </button>
                </td>
                <td>{new Date(item.orderDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => openPurchase(item)} className="btn btn-primary px-3 py-1 text-xs">Purchase</button>
                </td>
              </>
            ) : (
              <>
                <td>{item.supplierName}</td>
                <td>{item.supplierContact}</td>
                <td>₹{item.purchasePrice}</td>
                <td>{new Date(item.expectedDeliveryDate).toLocaleDateString()}</td>
                <td><StatusBadge status={item.status} /></td>
              </>
            )}
          </tr>
        )}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Place Purchase Order">
        {selectedItem && (
          <div className="space-y-4">
             <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
               <div className="pb-2"><strong>Ref Order:</strong> {selectedItem.orderId}</div>
               <div className="pt-2 flex justify-between"><span><strong>Item:</strong> {selectedItem.itemName}</span> <span>Qty: {selectedItem.quantity}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="input-label">Supplier Name <span className="text-red-500">*</span></label><input className="input-field" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} /></div>
              <div><label className="input-label">Supplier Contact</label><input className="input-field" value={formData.supplierContact} onChange={e => setFormData({...formData, supplierContact: e.target.value})} /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
