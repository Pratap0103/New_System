import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import ImageViewer from '../components/ImageViewer';
import SearchBar from '../components/SearchBar';
import { Eye, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Enquiries = () => {
  const [data, setData] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [summaryModal, setSummaryModal] = useState({ open: false, data: null });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  
  // Follow Up / Order Received Form State
  const [formData, setFormData] = useState({ 
    status: 'Follow Up', 
    nextDate: '', 
    remarks: '',
    deliveryDate: '',
    items: [{ name: '', qty: 1 }]
  });
  
  // New Enquiry Form State
  const [newEnquiry, setNewEnquiry] = useState({ 
    personName: '', personNumber: '', priority: 'Medium', remarks: '' 
  });

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { 
    // Migrate old data to new schema gracefully
    const rawData = get('jp_enquiries') || [];
    const migrated = rawData.map(d => ({
      ...d,
      enquiryId: d.enquiryId || d.orderId || generateId('ENQ'),
      priority: d.priority || 'Medium',
      items: d.items || (d.itemName ? [{ name: d.itemName, qty: d.quantity || 1 }] : [])
    }));
    setData(migrated); 
    setInventory(get('jp_inventory') || []);
  }, []);

  const pendingData = data.filter(d => !['Order Received', 'Order Cancelled'].includes(d.status));
  const historyData = data.filter(d => ['Order Received', 'Order Cancelled', 'Follow Up'].includes(d.status));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.enquiryId, q) || match(d.orderId, q) || match(d.personName, q) || match(d.personNumber, q);
      const matchStatus = !filterStatus || d.status === filterStatus;
      return matchSearch && matchStatus;
    });
  };

  const filteredData = applyFilters(activeTab === 'pending' ? pendingData : historyData);

  const openActionPopup = (item) => {
    setSelectedEnquiry(item);
    setFormData({ 
      status: 'Follow Up', 
      nextDate: item.nextDate || '', 
      remarks: '',
      deliveryDate: '',
      items: item.items && item.items.length > 0 ? item.items : [{ name: '', qty: 1 }]
    });
    setModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { name: '', qty: 1 }] }));
  };

  const handleRemoveItem = (idx) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = [...formData.items];
    newItems[idx][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = () => {
    if (formData.status === 'Follow Up' && !formData.nextDate) return alert('Next date required for Follow Up.');
    if (formData.status === 'Order Received') {
      if (formData.items.some(i => !i.name)) return alert('All items must have a name.');
      if (!formData.deliveryDate) return alert('Delivery Date is required for confirmed orders.');
    }

    let finalOrderId = selectedEnquiry.orderId;
    let finalStatus = formData.status;

    if (formData.status === 'Order Received' && !finalOrderId) {
      finalOrderId = generateId('OR');
      
      // Create new Order record
      const orders = get('jp_orders') || [];
      save('jp_orders', [...orders, {
        enquiryId: selectedEnquiry.enquiryId,
        orderId: finalOrderId,
        personName: selectedEnquiry.personName,
        personNumber: selectedEnquiry.personNumber,
        priority: selectedEnquiry.priority,
        orderDate: new Date().toISOString(), // Conversion date
        enquiryDate: selectedEnquiry.orderDate,
        deliveryDate: formData.deliveryDate,
        items: formData.items,
        remarks: formData.remarks || selectedEnquiry.remarks,
        status: 'Pending' // Order status in Orders module is Pending
      }]);
    }

    const updated = data.map(d => d.enquiryId === selectedEnquiry.enquiryId
      ? { 
          ...d, 
          status: finalStatus, 
          nextDate: formData.nextDate, 
          remarks: formData.remarks || d.remarks,
          orderId: finalOrderId,
          deliveryDate: formData.deliveryDate,
          items: formData.items
        }
      : d);
      
    setData(updated);
    save('jp_enquiries', updated);
    setModalOpen(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddEnquiry = () => {
    if (!newEnquiry.personName) return alert("Customer Name required");
    const newDoc = {
      enquiryId: generateId('ENQ'),
      personName: newEnquiry.personName,
      personNumber: newEnquiry.personNumber,
      priority: newEnquiry.priority,
      orderDate: new Date().toISOString(),
      status: 'New',
      remarks: newEnquiry.remarks,
      items: []
    };
    
    const updated = [newDoc, ...data];
    setData(updated);
    save('jp_enquiries', updated);
    setAddModalOpen(false);
    setNewEnquiry({ personName: '', personNumber: '', priority: 'Medium', remarks: '' });
    window.dispatchEvent(new Event('storage'));
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'text-red-600 bg-red-50';
    if (priority === 'Low') return 'text-gray-600 bg-gray-50';
    return 'text-blue-600 bg-blue-50';
  };

  const formatItems = (items) => {
    if (!items || items.length === 0) return '-';
    return items.map(i => `${i.name} (${i.qty})`).join(', ');
  };

  // ---- Table Columns ----
  const columnsPending = ['Enquiry ID', 'Person Name', 'Number', 'Priority', 'Summary', 'Qty', 'Image', 'Order Date', 'Next Follow Up', 'Remarks', 'Action'];
  const columnsHistory = ['Enquiry ID', 'Order ID', 'Person Name', 'Number', 'Priority', 'Order Status', 'Order Date', 'Items', 'Qty', 'Delivery Date', 'Remarks', 'Next Follow Up'];

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-1 sm:p-2 mb-2">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Enquiries</h2>

        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search ID, Name, Number…"
          filters={[{ label: 'All Status', value: filterStatus, onChange: setFilterStatus, options: [{label:'New', value:'New'}, {label:'Follow Up', value:'Follow Up'}, {label:'Order Received', value:'Order Received'}] }]}
          count={{ filtered: filteredData.length, total: activeTab === 'pending' ? pendingData.length : historyData.length }}
        />

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0 overflow-x-auto w-full xl:w-auto">
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`}
            onClick={() => { setActiveTab('pending'); setSearch(''); setFilterStatus(''); }}>
            Pending ({pendingData.length})
          </button>
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`}
            onClick={() => { setActiveTab('history'); setSearch(''); setFilterStatus(''); }}>
            History
          </button>
        </div>

        <button className="btn btn-primary flex items-center justify-center gap-1.5 w-full xl:w-auto shrink-0 whitespace-nowrap" onClick={() => setAddModalOpen(true)}>
          <Plus size={16} />
          <span>New Enquiry</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={activeTab === 'pending' ? columnsPending : columnsHistory}
        data={filteredData}
        renderRow={(item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 transition-colors">
            {activeTab === 'pending' ? (
              <>
                <td className="font-medium text-gray-900">{item.enquiryId}</td>
                <td>{item.personName}</td>
                <td>{item.personNumber}</td>
                <td><span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>{item.priority}</span></td>
                <td>
                  <button onClick={() => setSummaryModal({ open: true, data: item })} className="text-sky-600 flex items-center gap-1 text-xs font-medium hover:underline">
                    <Eye size={14} /> View
                  </button>
                </td>
                <td className="font-bold text-sky-600">{item.items?.reduce((sum, i) => sum + Number(i.qty), 0) || 0}</td>
                <td>
                  {item.itemImage ? (
                    <button onClick={() => setImageModal({ open: true, url: item.itemImage })} className="text-sky-600 p-1 bg-sky-50 rounded hover:bg-sky-100 transition-colors">
                      <ImageIcon size={16} />
                    </button>
                  ) : (
                    <span className="text-gray-300"><ImageIcon size={16} /></span>
                  )}
                </td>
                <td>{new Date(item.orderDate).toLocaleDateString()}</td>
                <td>{item.nextDate || '-'}</td>
                <td className="truncate max-w-[150px]">{item.remarks || '-'}</td>
                <td>
                  <button onClick={() => openActionPopup(item)} className="btn btn-primary px-3 py-1 text-xs">Action</button>
                </td>
              </>
            ) : (
              <>
                <td className="font-medium text-gray-900">{item.enquiryId}</td>
                <td className="font-medium text-sky-600">{item.orderId || '-'}</td>
                <td>{item.personName}</td>
                <td>{item.personNumber}</td>
                <td><span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>{item.priority}</span></td>
                <td><StatusBadge status={item.status} /></td>
                <td>{new Date(item.orderDate).toLocaleDateString()}</td>
                <td className="truncate max-w-[200px]" title={formatItems(item.items)}>{formatItems(item.items)}</td>
                <td className="font-bold text-sky-600">{item.items?.reduce((sum, i) => sum + Number(i.qty), 0) || 0}</td>
                <td>{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : '-'}</td>
                <td className="truncate max-w-[150px]">{item.remarks || '-'}</td>
                <td>{item.nextDate || '-'}</td>
              </>
            )}
          </tr>
        )}
      />

      {/* Summary Modal */}
      <PopupModal isOpen={summaryModal.open} onClose={() => setSummaryModal({ open: false, data: null })} title="Enquiry Summary">
        {summaryModal.data && (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <p><strong>Customer:</strong> {summaryModal.data.personName} ({summaryModal.data.personNumber})</p>
              <p><strong>Enquiry Date:</strong> {new Date(summaryModal.data.orderDate).toLocaleString()}</p>
              <p><strong>Priority:</strong> {summaryModal.data.priority}</p>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">Chat & Remarks History:</p>
              <div className="bg-gray-100 p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
                {summaryModal.data.remarks || "No summary or remarks available for this enquiry."}
              </div>
            </div>
          </div>
        )}
      </PopupModal>

      {/* Action Form Modal */}
      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Enquiry Status">
        <div className="space-y-4">
          {selectedEnquiry && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-700 space-y-2">
              <p><strong>Customer:</strong> {selectedEnquiry.personName} ({selectedEnquiry.personNumber})</p>
              {selectedEnquiry.itemImage && (
                <div>
                  <p className="font-semibold mb-1">Attached Image:</p>
                  <img src={selectedEnquiry.itemImage} alt="Enquiry" className="h-20 w-auto rounded border border-gray-300" />
                </div>
              )}
              {selectedEnquiry.remarks && (
                <div>
                  <p className="font-semibold mb-1">Remarks Summary:</p>
                  <div className="text-xs bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">
                    {selectedEnquiry.remarks}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="input-label">Update Status</label>
            <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Follow Up">Follow Up</option>
              <option value="Order Received">Order Received</option>
              <option value="Order Cancelled">Order Cancelled</option>
            </select>
          </div>

          {formData.status === 'Follow Up' && (
            <div>
              <label className="input-label">Next Follow Up Date <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" value={formData.nextDate} onChange={e => setFormData({...formData, nextDate: e.target.value})} />
            </div>
          )}

          {formData.status === 'Order Received' && (
            <div className="space-y-3 bg-sky-50 p-4 rounded-xl border border-sky-100">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sky-800 text-sm">Order Items</h4>
                <button onClick={handleAddItem} className="text-sky-600 text-xs font-medium flex items-center gap-1 hover:text-sky-800">
                  <Plus size={14} /> Add Item
                </button>
              </div>
              
              <datalist id="inventory-items">
                {inventory.map((inv, idx) => (
                  <option key={idx} value={inv.productName} />
                ))}
              </datalist>

              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-sky-100">
                  <div className="flex-1">
                    <input type="text" list="inventory-items" placeholder="Search Item Name..." className="input-field py-1.5 text-xs h-8" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} />
                  </div>
                  <div className="w-20">
                    <input type="number" min="1" placeholder="Qty" className="input-field py-1.5 text-xs h-8" value={item.qty} onChange={e => handleItemChange(idx, 'qty', e.target.value)} />
                  </div>
                  {formData.items.length > 1 && (
                    <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <div className="pt-2">
                <label className="input-label">Delivery Date <span className="text-red-500">*</span></label>
                <input type="date" className="input-field" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
              </div>
            </div>
          )}

          <div>
            <label className="input-label">Remarks / Notes</label>
            <textarea className="input-field" rows="2" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="Add any comments..."></textarea>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary flex-1 py-2">Cancel</button>
            <button onClick={handleSubmit} className="btn btn-primary flex-1 py-2">Save Update</button>
          </div>
        </div>
      </PopupModal>

      {/* Add New Enquiry Modal */}
      <PopupModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Enquiry">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="input-label">Customer Name <span className="text-red-500">*</span></label><input className="input-field" value={newEnquiry.personName} onChange={e => setNewEnquiry({...newEnquiry, personName: e.target.value})} /></div>
            <div><label className="input-label">Phone Number</label><input className="input-field" value={newEnquiry.personNumber} onChange={e => setNewEnquiry({...newEnquiry, personNumber: e.target.value})} /></div>
          </div>
          <div>
            <label className="input-label">Priority</label>
            <select className="input-field" value={newEnquiry.priority} onChange={e => setNewEnquiry({...newEnquiry, priority: e.target.value})}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div><label className="input-label">Summary / Remarks</label><textarea className="input-field" rows="3" value={newEnquiry.remarks} onChange={e => setNewEnquiry({...newEnquiry, remarks: e.target.value})} placeholder="Enter chat summary or initial notes..."></textarea></div>
          <div className="pt-2">
            <button onClick={handleAddEnquiry} className="btn btn-primary w-full py-2.5">Save Enquiry</button>
          </div>
        </div>
      </PopupModal>

      <ImageViewer isOpen={imageModal.open} imageUrl={imageModal.url} onClose={() => setImageModal({ open: false, url: '' })} />
    </div>
  );
};

export default Enquiries;
