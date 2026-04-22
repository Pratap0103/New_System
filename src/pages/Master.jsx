import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import DataTable from '../components/DataTable';
import PopupModal from '../components/PopupModal';

const Master = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    productName: '', category: '', hsnCode: '', unit: 'pcs', purchasePrice: '', sellingPrice: '', gstRate: 18, openingStock: 0 
  });

  useEffect(() => {
    setData(get('jp_master'));
  }, []);

  const handleAdd = () => {
    if (!formData.productName) return alert("Product Name required");
    const skuId = generateId('SKU');
    const newItem = {
      ...formData,
      skuId,
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      gstRate: Number(formData.gstRate),
      openingStock: Number(formData.openingStock)
    };

    const updated = [...data, newItem];
    setData(updated);
    save('jp_master', updated);

    // Sync opening stock to inventory if > 0
    if (newItem.openingStock >= 0) {
      const inv = get('jp_inventory');
      save('jp_inventory', [...inv, {
        skuId: newItem.skuId,
        productName: newItem.productName,
        category: newItem.category,
        unitPrice: newItem.sellingPrice,
        availableStock: newItem.openingStock,
        hsnCode: newItem.hsnCode,
        unit: newItem.unit,
        gstRate: newItem.gstRate
      }]);
    }

    setModalOpen(false);
    setFormData({ productName: '', category: '', hsnCode: '', unit: 'pcs', purchasePrice: '', sellingPrice: '', gstRate: 18, openingStock: 0 });
    window.dispatchEvent(new Event("storage"));
  };

  const columns = ['SKU ID', 'Product Name', 'Category', 'HSN Code', 'Unit', 'Purchase Price', 'Selling Price', 'GST Rate', 'Action'];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Item Master</h2>
          <p className="text-sm text-gray-500">Single source of truth for all products.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Add Master Item</button>
      </div>

      <DataTable 
        columns={columns}
        data={data}
        renderRow={(item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 transition-colors">
            <td className="font-medium text-gray-900">{item.skuId}</td>
            <td>{item.productName}</td>
            <td><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.category}</span></td>
            <td>{item.hsnCode}</td>
            <td>{item.unit}</td>
            <td>₹{item.purchasePrice}</td>
            <td className="font-bold text-indigo-600">₹{item.sellingPrice}</td>
            <td>{item.gstRate}%</td>
            <td>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
              </div>
            </td>
          </tr>
        )}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Item to Master Catalog">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="input-label">Product Name <span className="text-red-500">*</span></label><input className="input-field" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} /></div>
            <div><label className="input-label">Category</label><input className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="input-label">HSN Code</label><input className="input-field" value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} /></div>
            <div>
              <label className="input-label">Measurement Unit</label>
              <select className="input-field" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                <option value="pcs">Pieces (pcs)</option>
                <option value="set">Sets (set)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="ltr">Liters (ltr)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="input-label">Purchase Price</label><input type="number" className="input-field" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} /></div>
            <div><label className="input-label">Selling Price</label><input type="number" className="input-field" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} /></div>
            <div><label className="input-label">GST Rate (%)</label><input type="number" className="input-field" value={formData.gstRate} onChange={e => setFormData({...formData, gstRate: e.target.value})} /></div>
          </div>
          <div><label className="input-label">Opening Stock (Injected to Inventory)</label><input type="number" className="input-field" value={formData.openingStock} onChange={e => setFormData({...formData, openingStock: e.target.value})} /></div>
          
          <div className="pt-2">
            <button onClick={handleAdd} className="btn btn-primary w-full py-2.5">Save to Master & Inventory</button>
          </div>
        </div>
      </PopupModal>
    </div>
  );
};

export default Master;
