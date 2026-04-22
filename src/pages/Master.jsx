import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import DataTable from '../components/DataTable';
import PopupModal from '../components/PopupModal';
import SearchBar from '../components/SearchBar';
import { Plus } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Master = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: '', category: '', hsnCode: '', unit: 'pcs', purchasePrice: '', sellingPrice: '', gstRate: 18, openingStock: 0
  });

  // Search state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    setData(get('jp_master'));
  }, []);

  const categories = [...new Set(data.map(item => item.category || 'Uncategorized'))].map(c => ({ label: c, value: c }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.skuId, q) || match(d.productName, q) || match(d.hsnCode, q);
      const matchCategory = !filterCategory || (d.category || 'Uncategorized') === filterCategory;
      return matchSearch && matchCategory;
    });
  };

  const filteredData = applyFilters(data);

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

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 mr-3">
          <p className="font-bold text-sm text-gray-900 truncate">{item.productName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{item.skuId}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{item.category || 'Uncategorized'}</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">{item.unit}</span>
            {item.hsnCode && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-xs">HSN: {item.hsnCode}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500">Buy: ₹{item.purchasePrice}</p>
          <p className="text-base font-bold text-sky-600">₹{item.sellingPrice}</p>
          <p className="text-xs text-gray-400">GST: {item.gstRate}%</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3 border-t border-gray-100 pt-3">
        <button className="btn btn-secondary flex-1 py-1.5 text-xs">Edit</button>
        <button className="flex-1 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">Delete</button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-gray-200 rounded-xl shadow-sm">
        <div className="hidden sm:block shrink-0 pr-2 border-r border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Item Master</h2>
          <p className="text-xs text-gray-500 mt-0.5">Catalog source</p>
        </div>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search SKU ID, Product Name, HSN Code…"
          filters={[{ label: 'All Categories', value: filterCategory, onChange: setFilterCategory, options: categories }]}
          count={{ filtered: filteredData.length, total: data.length }}
        />

        <button className="btn btn-primary flex items-center justify-center gap-1.5 w-full xl:w-auto shrink-0 whitespace-nowrap" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Add Master Item</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        renderRow={(item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 transition-colors">
            <td className="font-medium text-gray-900">{item.skuId}</td>
            <td>{item.productName}</td>
            <td><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.category || 'Uncategorized'}</span></td>
            <td>{item.hsnCode}</td>
            <td>{item.unit}</td>
            <td>₹{item.purchasePrice}</td>
            <td className="font-bold text-sky-600">₹{item.sellingPrice}</td>
            <td>{item.gstRate}%</td>
            <td>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
              </div>
            </td>
          </tr>
        )}
        renderCard={renderCard}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Item to Master Catalog">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="input-label">Product Name <span className="text-red-500">*</span></label><input className="input-field" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} /></div>
            <div><label className="input-label">Category</label><input className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
