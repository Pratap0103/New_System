import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { generateInvoicePDF } from '../utils/InvoicePDF';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import SearchBar from '../components/SearchBar';
import { Download } from 'lucide-react';

const match = (val, q) => String(val || '').toLowerCase().includes(q);

const Invoices = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [invoiceConfig, setInvoiceConfig] = useState(null);

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterItem, setFilterItem] = useState('');

  useEffect(() => {
    setData(get('jp_invoices') || []);
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Invoiced');

  const itemNames = [...new Set(data.flatMap(item => item.items?.map(i => i.name) || []))].filter(Boolean).map(i => ({ label: i, value: i }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.orderId, q) || match(d.invoiceId, q) || match(d.customerName || d.personName, q) || (d.items && d.items.some(i => match(i.name, q)));
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchItem = !filterItem || (d.items && d.items.some(i => i.name === filterItem));
      return matchSearch && matchStatus && matchItem;
    });
  };

  const baseData = activeTab === 'pending' ? pendingData : historyData;
  const filteredData = applyFilters(baseData);

  const openInvoice = (item) => {
    setSelectedItem(item);
    setInvoiceConfig({
      invoiceId: generateId('INV'),
      customerName: item.personName || item.customerName || 'Walk-in Customer',
      personNumber: item.personNumber || '',
      items: item.items || [],
      totalAmount: item.totalAmount || 0,
      invoiceDate: new Date().toISOString(),
      paymentTerms: 'Payment due within 15 days.',
      orderId: item.orderId
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    generateInvoicePDF(invoiceConfig);
    const updated = data.map(d => d.orderId === selectedItem.orderId ? {
      ...d,
      status: 'Invoiced',
      invoiceId: invoiceConfig.invoiceId,
      customerName: invoiceConfig.customerName,
      items: invoiceConfig.items,
      totalAmount: invoiceConfig.totalAmount,
      invoiceDate: invoiceConfig.invoiceDate
    } : d);

    const dispatches = get('jp_dispatches') || [];
    save('jp_dispatches', [...dispatches, {
      invoiceId: invoiceConfig.invoiceId,
      orderId: invoiceConfig.orderId,
      personName: invoiceConfig.customerName,
      items: invoiceConfig.items,
      totalAmount: invoiceConfig.totalAmount,
      status: 'Pending'
    }]);

    setData(updated);
    save('jp_invoices', updated);
    setModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const downloadPDFManual = (item) => {
    generateInvoicePDF({ ...item, invoiceId: item.invoiceId || 'N/A' });
  };

  const columnsPending = ['Action', 'Order ID', 'Enquiry ID', 'Person Name', 'Items', 'Qty', 'Total'];
  const columnsHistory = ['Invoice ID', 'Order ID', 'Enquiry ID', 'Customer', 'Items', 'Qty', 'Total', 'Date', 'PDF', 'Status'];

  const renderPendingCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
          <p className="text-sm font-medium text-gray-700">{item.personName || item.customerName}</p>
          <p className="text-xs text-gray-500 mt-1">{item.items?.map(i => `${i.name} (x${i.qty})`).join(', ') || 'No Items'}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sky-600 text-base">₹{item.totalAmount || 0}</p>
        </div>
      </div>
      <button onClick={() => openInvoice(item)} className="btn btn-primary w-full py-2 text-xs">Create Invoice</button>
    </div>
  );

  const renderHistoryCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-sky-700">{item.invoiceId}</p>
          <p className="text-xs text-gray-500">{item.orderId}</p>
          <p className="text-sm font-medium text-gray-700 mt-1">{item.customerName}</p>
          <p className="text-xs text-gray-600 mt-1">{item.items?.map(i => `${i.name} (x${i.qty})`).join(', ')}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={item.status} />
          <button onClick={() => downloadPDFManual(item)} className="text-sky-600 hover:text-sky-900 p-2 bg-sky-50 rounded-lg">
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2">
        <span className="font-bold text-gray-900">Total Amount: ₹{item.totalAmount}</span>
        <span className="text-gray-400">{new Date(item.invoiceDate).toLocaleDateString()}</span>
      </div>
    </div>
  );

  const statusOptions = activeTab === 'pending'
    ? [{ label: 'Pending', value: 'Pending' }]
    : [{ label: 'Invoiced', value: 'Invoiced' }];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-1 sm:p-2 mb-2">
        <h2 className="text-lg font-bold text-gray-900 shrink-0 hidden sm:block">Invoices</h2>
        <SearchBar
          search={search}
          onSearch={setSearch}
          placeholder="Search Invoice ID, Order ID, Customer…"
          filters={[
            { label: 'All Items', value: filterItem, onChange: setFilterItem, options: itemNames },
            { label: 'All Status', value: filterStatus, onChange: setFilterStatus, options: statusOptions }
          ]}
          count={{ filtered: filteredData.length, total: baseData.length }}
        />
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0 overflow-x-auto w-full xl:w-auto">
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('pending'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
            Ready ({pendingData.length})
          </button>
          <button className={`flex-1 xl:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-white shadow text-sky-600' : 'text-gray-600'}`} onClick={() => { setActiveTab('history'); setSearch(''); setFilterStatus(''); setFilterItem(''); }}>
            Archived
          </button>
        </div>
      </div>

      <DataTable
        columns={activeTab === 'pending' ? columnsPending : columnsHistory}
        data={filteredData}
        renderRow={(item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 transition-colors">
            {activeTab === 'pending' ? (
              <>
                <td><button onClick={() => openInvoice(item)} className="btn btn-primary px-3 py-1 text-xs">Create Invoice</button></td>
                <td className="font-medium text-gray-900">{item.orderId}</td>
                <td className="text-xs text-gray-500">{item.enquiryId || '-'}</td>
                <td>{item.personName || item.customerName}</td>
                <td className="max-w-[200px] truncate">{item.items?.map(i => `${i.name} (x${i.qty})`).join(', ')}</td>
                <td className="font-bold text-sky-600">{item.items?.reduce((sum, i) => sum + Number(i.qty), 0) || 0}</td>
                <td className="font-bold text-sky-600">₹{item.totalAmount || 0}</td>
              </>
            ) : (
              <>
                <td className="font-medium text-gray-900">{item.invoiceId}</td>
                <td className="text-gray-500 text-xs">{item.orderId}</td>
                <td className="text-gray-500 text-xs">{item.enquiryId || '-'}</td>
                <td>{item.customerName}</td>
                <td className="max-w-[200px] truncate">{item.items?.map(i => `${i.name} (x${i.qty})`).join(', ')}</td>
                <td className="font-bold text-sky-600">{item.items?.reduce((sum, i) => sum + Number(i.qty), 0) || 0}</td>
                <td className="font-bold">₹{item.totalAmount}</td>
                <td className="text-xs">{new Date(item.invoiceDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => downloadPDFManual(item)} className="text-sky-600 hover:text-sky-900 p-1 bg-sky-50 rounded">
                    <Download size={16} />
                  </button>
                </td>
                <td><StatusBadge status={item.status} /></td>
              </>
            )}
          </tr>
        )}
        renderCard={activeTab === 'pending' ? renderPendingCard : renderHistoryCard}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Invoice Generation Confirmation">
        {invoiceConfig && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
              <div className="pb-2 font-mono text-xs">{invoiceConfig.invoiceId}</div>
              <div className="py-2"><strong>Customer:</strong> {invoiceConfig.customerName}</div>
              <div className="py-2"><strong>Order ID:</strong> {invoiceConfig.orderId}</div>
              <div className="py-3">
                <p className="font-bold mb-1">Items:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {invoiceConfig.items?.map((it, i) => <li key={i}>{it.name} x {it.qty}</li>)}
                </ul>
              </div>
              <div className="pt-2 text-right">
                <div className="font-bold text-lg text-sky-700 mt-2">Total Amount: ₹{invoiceConfig.totalAmount}</div>
              </div>
            </div>
            <div>
              <label className="input-label">Payment Terms & Notes to Customer</label>
              <textarea rows="2" className="input-field" value={invoiceConfig.paymentTerms} onChange={e => setInvoiceConfig({...invoiceConfig, paymentTerms: e.target.value})} />
            </div>
            <div className="pt-2 flex flex-col space-y-2">
              <p className="text-xs text-gray-500 text-center">Submitting will automatically download a PDF formatted using your Settings.</p>
              <button onClick={handleSubmit} className="btn btn-primary w-full py-2.5">Generate PDF & Dispatch Order</button>
            </div>
          </div>
        )}
      </PopupModal>
    </div>
  );
};

export default Invoices;
