import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import DataTable from '../components/DataTable';
import PopupModal from '../components/PopupModal';
import SearchBar from '../components/SearchBar';
import { Plus } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Inventory = () => {
  const [data, setData] = useState([]);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updateQty, setUpdateQty] = useState('');
  const [newItem, setNewItem] = useState({ productName: '', category: '', unitPrice: '', availableStock: '', unit: 'pcs' });

  // Search state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    setData(get('jp_inventory'));
  }, []);

  // Compute unique categories for the filter
  const categories = [...new Set(data.map(item => item.category || 'Uncategorized'))].map(c => ({ label: c, value: c }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.skuId, q) || match(d.productName, q);
      const matchCategory = !filterCategory || (d.category || 'Uncategorized') === filterCategory;
      return matchSearch && matchCategory;
    });
  };

  const filteredData = applyFilters(data);

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
    window.dispatchEvent(new Event("storage"));
  };

  const columns = ['SKU ID', 'Product Name', 'Category', 'Unit Price', 'Stock', 'Actions'];

  const renderCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 mr-3">
          <p className="font-bold text-sm text-gray-900 truncate">{item.productName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{item.skuId}</p>
          <span className="inline-block mt-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{item.category || 'Uncategorized'}</span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-gray-700">₹{item.unitPrice}</p>
          <p className={`text-lg font-bold mt-0.5 ${item.availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.availableStock}</p>
          <p className="text-xs text-gray-400">in stock</p>
        </div>
      </div>
      <button onClick={() => openUpdate(item)} className="btn btn-secondary w-full mt-3 py-1.5 text-xs">Update Stock</button>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Inventory Management</h2>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search by SKU ID, Product Name…"
          filters={[{ label: 'All Categories', value: filterCategory, onChange: setFilterCategory, options: categories }]}
          count={{ filtered: filteredData.length, total: data.length }}
        />

        <button className="btn btn-primary flex items-center justify-center gap-1.5 w-full xl:w-auto shrink-0 whitespace-nowrap" onClick={() => setAddModalOpen(true)}>
          <Plus size={16} />
          <span>Add New Item</span>
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
            <td>₹{item.unitPrice}</td>
            <td className={`font-bold ${item.availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.availableStock}</td>
            <td>
              <button onClick={() => openUpdate(item)} className="btn btn-secondary px-3 py-1 text-xs">Update Stock</button>
            </td>
          </tr>
        )}
        renderCard={renderCard}
      />

      {/* Update Stock Modal */}
      <PopupModal isOpen={updateModalOpen} onClose={() => setUpdateModalOpen(false)} title="Update Stock Status">
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 border border-gray-200">
              <div><strong>SKU:</strong> {selectedItem.skuId}</div>
              <div className="mt-1"><strong>Item:</strong> {selectedItem.productName}</div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="input-label">Category</label><input className="input-field" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} /></div>
            <div><label className="input-label">Unit</label><input className="input-field" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
