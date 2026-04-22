import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import ImageViewer from '../components/ImageViewer';
import SearchBar from '../components/SearchBar';
import { Image as ImageIcon } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Orders = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockStatus, setStockStatus] = useState('Available');

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterItem, setFilterItem] = useState('');

  useEffect(() => {
    setData(get('jp_orders'));
  }, []);

  const pendingData = data.filter(d => d.status === 'Pending');
  const itemNames = [...new Set(pendingData.map(item => item.itemName))].filter(Boolean).map(i => ({ label: i, value: i }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.orderId, q) || match(d.personName, q) || match(d.personNumber, q) || match(d.itemName, q);
      const matchItem = !filterItem || d.itemName === filterItem;
      return matchSearch && matchItem;
    });
  };

  const filteredData = applyFilters(pendingData);

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

  const columns = ['Order ID', 'Person Name', 'Number', 'Item Name', 'Qty', 'Image', 'Order Date', 'Action'];

  const renderCard = (item, idx) => (
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
        <button onClick={() => openStockCheck(item)} className="btn btn-primary px-3 py-1.5 text-xs whitespace-nowrap">
          Check Stock
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Orders</h2>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search Order ID, Name, Number…"
          filters={[{ label: 'All Items', value: filterItem, onChange: setFilterItem, options: itemNames }]}
          count={{ filtered: filteredData.length, total: pendingData.length }}
        />
      </div>

      <DataTable
        columns={columns}
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
            <td>
              <button onClick={() => openStockCheck(item)} className="btn btn-primary px-3 py-1 text-xs whitespace-nowrap">Check in Stock</button>
            </td>
          </tr>
        )}
        renderCard={renderCard}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Stock Validation">
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
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
