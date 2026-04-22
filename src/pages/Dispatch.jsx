import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';

const Dispatch = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [formData, setFormData] = useState({ 
    deliveryAddress: '', transportName: '', vehicleNumber: '', driverContact: '', 
    dispatchDate: '', estimatedDeliveryDate: '', notes: '' 
  });

  useEffect(() => {
    setData(get('jp_dispatches'));
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Dispatched');

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
      dispatchId: dispatchId,
      deliveryAddress: formData.deliveryAddress,
      transportName: formData.transportName,
      vehicleNumber: formData.vehicleNumber,
      driverContact: formData.driverContact,
      dispatchDate: formData.dispatchDate,
      estimatedDeliveryDate: formData.estimatedDeliveryDate,
      notes: formData.notes
    } : d);

    // Decrease Inventory Stock
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

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dispatch Operations</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('pending')}>
            Ready for Loading ({pendingData.length})
          </button>
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('history')}>
            Dispatched Cargo
          </button>
        </div>
      </div>

      <DataTable 
        columns={activeTab === 'pending' ? columnsPending : columnsHistory}
        data={activeTab === 'pending' ? pendingData : historyData}
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
                <td>
                  <button onClick={() => openDispatch(item)} className="btn btn-primary px-3 py-1 text-xs">Dispatch</button>
                </td>
              </>
            ) : (
              <>
                <td className="font-medium text-gray-900">{item.dispatchId}</td>
                <td className="text-xs text-gray-500 hover:text-indigo-600 cursor-pointer">{item.invoiceId}</td>
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
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Finalize Dispatch Order">
        {selectedItem && (
          <div className="space-y-4">
             <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
               <div className="pb-2 flex justify-between"><span><strong>Invoice:</strong> {selectedItem.invoiceId}</span></div>
               <div className="pt-2 flex justify-between"><span><strong>Destination:</strong> {selectedItem.personName}</span> <span>{selectedItem.itemName} (x{selectedItem.quantity})</span></div>
            </div>

            <div><label className="input-label">Delivery Address</label><textarea rows="2" className="input-field" value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div><label className="input-label">Transport Name / Courier <span className="text-red-500">*</span></label><input className="input-field" value={formData.transportName} onChange={e => setFormData({...formData, transportName: e.target.value})} /></div>
              <div><label className="input-label">Vehicle / Tracking Number</label><input className="input-field" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
