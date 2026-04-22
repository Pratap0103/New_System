import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import DataTable from '../components/DataTable';
import PopupModal from '../components/PopupModal';

const Inventory = () => {
  const [data, setData] = useState([]);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [updateQty, setUpdateQty] = useState('');
  
  const [newItem, setNewItem] = useState({ productName: '', category: '', unitPrice: '', availableStock: '', unit: 'pcs' });

  useEffect(() => {
    setData(get('jp_inventory'));
  }, []);

  const openUpdate = (item) => {
    setSelectedItem(item);
    setUpdateQty(item.availableStock);
    setUpdateModalOpen(true);
  };

  const handleUpdateStock = () => {
    const updated = data.map(d => d.skuId === selectedItem.skuId ? { ...d, availableStock: Number(updateQty) } : d);
    setData(updated);
    save('jp_inventory', updated);
    setUpdateModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const handleAddItem = () => {
    if (!newItem.productName) return alert('Product Name is required');
    const sku = generateId('SKU');
    const updated = [...data, { ...newItem, skuId: sku, unitPrice: Number(newItem.unitPrice), availableStock: Number(newItem.availableStock) }];
    setData(updated);
    save('jp_inventory', updated);
    setAddModalOpen(false);
    setNewItem({ productName: '', category: '', unitPrice: '', availableStock: '', unit: 'pcs' });
  };

  const columns = ['SKU ID', 'Product Name', 'Category', 'Unit Price', 'Available Stock', 'Actions'];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>Add New Item</button>
      </div>

      <DataTable 
        columns={columns}
        data={data}
        renderRow={(item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 transition-colors">
            <td className="font-medium text-gray-900">{item.skuId}</td>
            <td>{item.productName}</td>
            <td><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.category || 'Uncategorized'}</span></td>
            <td>₹{item.unitPrice}</td>
            <td className={`font-bold ${item.availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.availableStock}</td>
            <td>
              <button onClick={() => openUpdate(item)} className="btn btn-secondary px-3 py-1 text-xs">Update Stock</button>
            </td>
          </tr>
        )}
      />

      {/* Update Stock Modal */}
      <PopupModal isOpen={updateModalOpen} onClose={() => setUpdateModalOpen(false)} title="Update Stock Status">
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 border border-gray-200">
               <div><strong>SKU:</strong> {selectedItem.skuId}</div>
               <div><strong>Item:</strong> {selectedItem.productName}</div>
            </div>
            <div>
              <label className="input-label">New Available Amount</label>
              <input type="number" className="input-field" value={updateQty} onChange={e => setUpdateQty(e.target.value)} />
            </div>
            <div className="pt-2">
              <button onClick={handleUpdateStock} className="btn btn-primary w-full py-2.5">Update Stock</button>
            </div>
          </div>
        )}
      </PopupModal>

      {/* Add New Item Modal */}
      <PopupModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Inventory Item">
        <div className="space-y-4">
          <div><label className="input-label">Auto-generated SKU</label><input className="input-field bg-gray-100" disabled value="SKU-[Auto]" /></div>
          <div><label className="input-label">Product Name</label><input className="input-field" value={newItem.productName} onChange={e => setNewItem({...newItem, productName: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="input-label">Category</label><input className="input-field" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} /></div>
            <div><label className="input-label">Unit</label><input className="input-field" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="input-label">Unit Price (₹)</label><input type="number" className="input-field" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: e.target.value})} /></div>
             <div><label className="input-label">Opening Stock</label><input type="number" className="input-field" value={newItem.availableStock} onChange={e => setNewItem({...newItem, availableStock: e.target.value})} /></div>
          </div>
          <div className="pt-2">
            <button onClick={handleAddItem} className="btn btn-primary w-full py-2.5">Save to Inventory</button>
          </div>
        </div>
      </PopupModal>
    </div>
  );
};

export default Inventory;
