import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import ImageViewer from '../components/ImageViewer';
import { Image as ImageIcon } from 'lucide-react';

const Orders = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [stockStatus, setStockStatus] = useState('Available');

  useEffect(() => {
    setData(get('jp_orders'));
  }, []);

  const openStockCheck = (item) => {
    setSelectedItem(item);
    setStockStatus('Available');
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const updated = data.map(d => d.orderId === selectedItem.orderId ? {
      ...d, status: stockStatus, updatedDate: new Date().toISOString()
    } : d);

    if (stockStatus === 'Available') {
      const invoices = get('jp_invoices');
      save('jp_invoices', [...invoices, { ...selectedItem, status: 'Pending' }]);
    } else {
      const purchases = get('jp_purchases');
      save('jp_purchases', [...purchases, { ...selectedItem, status: 'Pending' }]);
    }

    setData(updated);
    save('jp_orders', updated);
    setModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const pendingData = data.filter(d => d.status === 'Pending');
  const columnsPending = ['Order ID', 'Person Name', 'Number', 'Item Name', 'Qty', 'Image', 'Order Date', 'Action'];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Orders (Stock Check)</h2>
      </div>

      <DataTable 
        columns={columnsPending}
        data={pendingData}
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
            <td>
              <button onClick={() => openStockCheck(item)} className="btn btn-primary px-3 py-1 text-xs whitespace-nowrap">Check in Stock</button>
            </td>
          </tr>
        )}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Stock Validation">
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
               <div className="pb-2"><strong>Required Item:</strong> {selectedItem.itemName}</div>
               <div className="pt-2"><strong>Required Qty:</strong> {selectedItem.quantity}</div>
            </div>

            <div>
              <label className="input-label">Is Stock Available?</label>
              <select className="input-field" value={stockStatus} onChange={e => setStockStatus(e.target.value)}>
                <option value="Available">Available (Proceed to Invoice)</option>
                <option value="Not Available">Not Available (Request Purchase)</option>
              </select>
            </div>

            <div className="pt-2">
              <button onClick={handleSubmit} className="btn btn-primary w-full py-2.5">Confirm Stock Status</button>
            </div>
          </div>
        )}
      </PopupModal>
      
      <ImageViewer isOpen={imageModal.open} onClose={() => setImageModal({ open: false, url: '' })} />
    </div>
  );
};

export default Orders;
