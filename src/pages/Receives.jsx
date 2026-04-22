import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';

const Receives = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [formData, setFormData] = useState({ receivedQty: '', receivedDate: '', condition: 'Good', receivedBy: '', remarks: '' });

  useEffect(() => {
    setData(get('jp_receives'));
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Received');

  const openReceive = (item) => {
    setSelectedItem(item);
    setFormData({ receivedQty: item.quantity, receivedDate: new Date().toISOString().split('T')[0], condition: 'Good', receivedBy: '', remarks: '' });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.receivedQty || !formData.receivedBy) return alert("Received Qty and Received By required.");

    // Update Receive History
    const updated = data.map(d => d.orderId === selectedItem.orderId ? {
      ...d, 
      status: 'Received',
      receivedQty: Number(formData.receivedQty),
      receivedDate: formData.receivedDate,
      condition: formData.condition,
      receivedBy: formData.receivedBy,
      remarks: formData.remarks
    } : d);

    // Increase Inventory Stock
    const inventory = get('jp_inventory');
    // Attempt matching product name closely or by order lookup logic. Simplified match:
    const updatedInventory = inventory.map(inv => inv.productName.includes(selectedItem.itemName) || selectedItem.itemName.includes(inv.productName) ? {
      ...inv, availableStock: Number(inv.availableStock) + Number(formData.receivedQty)
    } : inv);
    save('jp_inventory', updatedInventory);

    // Push to Invoices Pending
    const invoices = get('jp_invoices');
    save('jp_invoices', [...invoices, { 
      orderId: selectedItem.orderId,
      customerName: 'Customer (From Purchase)', // Extracted from master or linked list conceptually
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

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Receives (Inward)</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('pending')}>
            Incoming ({pendingData.length})
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
            <td>{item.itemName}</td>
            
            {activeTab === 'pending' ? (
              <>
                <td className="font-bold">{item.quantity}</td>
                <td>{item.supplierName}</td>
                <td>{new Date(item.expectedDeliveryDate).toLocaleDateString()}</td>
                <td><StatusBadge status="PendingReceive" /></td>
                <td>
                  <button onClick={() => openReceive(item)} className="btn btn-primary px-3 py-1 text-xs">Receive</button>
                </td>
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
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Stock Receipt">
        {selectedItem && (
          <div className="space-y-4">
             <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
               <div className="pb-2 flex justify-between"><span><strong>Supplier:</strong> {selectedItem.supplierName}</span></div>
               <div className="pt-2 flex justify-between"><span><strong>Item:</strong> {selectedItem.itemName}</span> <span>Expected Qty: {selectedItem.quantity}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="input-label">Actual Received Qty <span className="text-red-500">*</span></label><input type="number" className="input-field" value={formData.receivedQty} onChange={e => setFormData({...formData, receivedQty: e.target.value})} /></div>
              <div><label className="input-label">Received Date</label><input type="date" className="input-field" disabled value={formData.receivedDate} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
