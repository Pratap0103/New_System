import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import SearchBar from '../components/SearchBar';
import { CheckSquare } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Orders = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [individualStatuses, setIndividualStatuses] = useState({});

  // Search state
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Migration for old data
    const rawData = get('jp_orders') || [];
    const migrated = rawData.map(d => ({
      ...d,
      enquiryId: d.enquiryId || d.orderId,
      priority: d.priority || 'Medium',
      items: d.items || (d.itemName ? [{ name: d.itemName, qty: d.quantity || 1 }] : [])
    }));
    setData(migrated);
  }, []);

  const pendingData = data.filter(d => d.status === 'Pending');

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      return !q || match(d.orderId, q) || match(d.enquiryId, q) || match(d.personName, q) || match(d.personNumber, q);
    });
  };

  const filteredData = applyFilters(pendingData);

  const toggleSelection = (orderId) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredData.map(d => d.orderId));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const openModalWithSelected = (ids) => {
    setSelectedOrderIds(ids);
    const initialStatuses = {};
    ids.forEach(id => {
      initialStatuses[id] = 'Available';
    });
    setIndividualStatuses(initialStatuses);
    setModalOpen(true);
  };

  const handleStatusChange = (orderId, status) => {
    setIndividualStatuses(prev => ({ ...prev, [orderId]: status }));
  };

  const handleBulkUpdate = () => {
    const selectedOrders = data.filter(d => selectedOrderIds.includes(d.orderId));
    
    // Update jp_orders status
    const updatedData = data.map(d => {
      if (selectedOrderIds.includes(d.orderId)) {
        return { ...d, status: individualStatuses[d.orderId], updatedDate: new Date().toISOString() };
      }
      return d;
    });

    // Move to Assemble or Purchases
    const currentAssembles = get('jp_assembles') || [];
    const currentPurchases = get('jp_purchases') || [];
    let newAssembles = [...currentAssembles];
    let newPurchases = [...currentPurchases];

    selectedOrders.forEach(order => {
      const status = individualStatuses[order.orderId];
      if (status === 'Available') {
        newAssembles.push({ ...order, status: 'Pending', source: 'Stock Check' });
      } else {
        newPurchases.push({ ...order, status: 'Pending' });
      }
    });

    save('jp_assembles', newAssembles);
    save('jp_purchases', newPurchases);
    setData(updatedData);
    save('jp_orders', updatedData);
    
    setSelectedOrderIds([]);
    setModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const formatItems = (items) => {
    if (!items || items.length === 0) return '-';
    return items.map(i => `${i.name} (${i.qty})`).join(', ');
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'text-red-600 bg-red-50';
    if (priority === 'Low') return 'text-gray-600 bg-gray-50';
    return 'text-blue-600 bg-blue-50';
  };

  const columns = [
    <input type="checkbox" onChange={toggleAll} checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredData.length} />,
    'Action', 'Enquiry ID', 'Order ID', 'Person Name', 'Number', 'Priority', 'Order Status', 'Order Date', 'Items', 'Qty', 'Delivery Date', 'Remarks'
  ];

  return (
    <div className="animate-fade-in space-y-4">
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-1 sm:p-2 mb-2">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Orders (Stock Check)</h2>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search Order ID, Enquiry ID, Name…"
          count={{ filtered: filteredData.length, total: pendingData.length }}
        />

        {selectedOrderIds.length > 0 && (
          <button 
            className="btn btn-primary flex items-center justify-center gap-2 shrink-0 animate-fade-in"
            onClick={() => openModalWithSelected(selectedOrderIds)}
          >
            <CheckSquare size={16} />
            Update Selected ({selectedOrderIds.length})
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        renderRow={(item, idx) => (
          <tr key={idx} className={`transition-colors ${selectedOrderIds.includes(item.orderId) ? 'bg-sky-50' : 'hover:bg-gray-50'}`}>
            <td>
              <input 
                type="checkbox" 
                checked={selectedOrderIds.includes(item.orderId)} 
                onChange={() => toggleSelection(item.orderId)}
                className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
              />
            </td>
             <td>
               <button onClick={() => {
                 openModalWithSelected([item.orderId]);
               }} className="btn btn-secondary px-3 py-1 text-xs">Update</button>
             </td>
             <td className="text-xs text-gray-500">{item.enquiryId || 'N/A'}</td>
            <td className="font-medium text-gray-900">{item.orderId || '-'}</td>
            <td>{item.personName || 'Unnamed'}</td>
            <td>{item.personNumber || '-'}</td>
            <td><span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority || 'Medium')}`}>{item.priority || 'Medium'}</span></td>
            <td><StatusBadge status={item.status || 'Pending'} /></td>
            <td>{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : '-'}</td>
            <td className="truncate max-w-[200px]" title={formatItems(item.items)}>{formatItems(item.items)}</td>
            <td className="font-bold text-sky-600">{item.items?.reduce((sum, i) => sum + Number(i.qty), 0) || 0}</td>
            <td>{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : '-'}</td>
            <td className="truncate max-w-[150px]">{item.remarks || '-'}</td>
          </tr>
        )}
      />

      {/* Bulk Update Modal */}
      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Update Stock Status (${selectedOrderIds.length} orders)`}>
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-sm text-sky-800">
            Select the stock availability for each item below:
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
            {data.filter(d => selectedOrderIds.includes(d.orderId)).map((order, idx) => (
              <div key={idx} className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-sky-600">{order.orderId}</p>
                    <p className="text-sm font-medium text-gray-900">{order.personName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-mono">{order.enquiryId}</p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {formatItems(order.items)}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock Status</label>
                  <select 
                    className="input-field py-1 h-9 text-sm mt-1" 
                    value={individualStatuses[order.orderId] || 'Available'} 
                    onChange={e => handleStatusChange(order.orderId, e.target.value)}
                  >
                    <option value="Available">Available (Send to Invoices)</option>
                    <option value="Not Available">Not Available (Send to Purchases)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary flex-1 py-2">Cancel</button>
            <button onClick={handleBulkUpdate} className="btn btn-primary flex-1 py-2">Save All Updates</button>
          </div>
        </div>
      </PopupModal>
    </div>
  );
};

export default Orders;
