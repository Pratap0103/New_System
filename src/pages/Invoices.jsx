import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { generateInvoicePDF } from '../utils/InvoicePDF';
import { calcInvoice } from '../utils/helpers';
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
    setData(get('jp_invoices'));
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Invoiced');

  const itemNames = [...new Set(data.map(item => item.item || item.itemName))].filter(Boolean).map(i => ({ label: i, value: i }));

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(d => {
      const matchSearch = !q || match(d.orderId, q) || match(d.invoiceId, q) || match(d.customerName || d.personName, q) || match(d.item || d.itemName, q);
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchItem = !filterItem || (d.item || d.itemName) === filterItem;
      return matchSearch && matchStatus && matchItem;
    });
  };

  const baseData = activeTab === 'pending' ? pendingData : historyData;
  const filteredData = applyFilters(baseData);

  const getInventoryPriceData = (itemName) => {
    const invData = get('jp_inventory');
    const matched = invData.find(i => itemName.includes(i.productName) || i.productName.includes(itemName));
    if (matched) return { price: matched.unitPrice, gst: matched.gstRate };
    return { price: 2000, gst: 18 };
  };

  const openInvoice = (item) => {
    setSelectedItem(item);
    const { price, gst } = getInventoryPriceData(item.item || item.itemName);
    const calcs = calcInvoice(item.quantity, price, gst);
    setInvoiceConfig({
      invoiceId: generateId('INV'),
      customerName: item.personName || item.customerName || 'Walk-in Customer',
      personNumber: item.personNumber || '',
      item: item.item || item.itemName,
      quantity: Number(item.quantity),
      unitPrice: price,
      subTotal: calcs.sub,
      gst: calcs.gst,
      gstRate: gst,
      totalAmount: calcs.total,
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
      subTotal: invoiceConfig.subTotal,
      gst: invoiceConfig.gst,
      totalAmount: invoiceConfig.totalAmount,
      invoiceDate: invoiceConfig.invoiceDate
    } : d);

    const dispatches = get('jp_dispatches');
    save('jp_dispatches', [...dispatches, {
      invoiceId: invoiceConfig.invoiceId,
      orderId: invoiceConfig.orderId,
      personName: invoiceConfig.customerName,
      itemName: invoiceConfig.item,
      quantity: invoiceConfig.quantity,
      totalAmount: invoiceConfig.totalAmount,
      status: 'Pending'
    }]);

    setData(updated);
    save('jp_invoices', updated);
    setModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const downloadPDFManual = (item) => {
    const { price, gst } = getInventoryPriceData(item.item);
    generateInvoicePDF({ ...item, invoiceId: item.invoiceId || 'N/A', quantity: item.quantity, unitPrice: price, subTotal: item.subTotal, gst: item.gst, totalAmount: item.totalAmount });
  };

  const columnsPending = ['Order ID', 'Person Name', 'Item Name', 'Qty', 'Unit Price', 'Sub Total', 'GST', 'Total', 'Action'];
  const columnsHistory = ['Invoice ID', 'Order ID', 'Customer', 'Item', 'Sub Total', 'GST', 'Total', 'Date', 'PDF', 'Status'];

  const renderPendingCard = (item, idx) => {
    const { price, gst } = getInventoryPriceData(item.item || item.itemName);
    const calcs = calcInvoice(item.quantity, price, gst);
    return (
      <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-sm text-gray-900">{item.orderId}</p>
            <p className="text-sm font-medium text-gray-700">{item.personName || item.customerName}</p>
            <p className="text-sm text-gray-600 mt-0.5">{item.item || item.itemName} × {item.quantity}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Unit: ₹{price}</p>
            <p className="text-xs text-gray-500">GST: ₹{calcs.gst}</p>
            <p className="font-bold text-sky-600 text-base mt-0.5">₹{calcs.total}</p>
          </div>
        </div>
        <button onClick={() => openInvoice(item)} className="btn btn-primary w-full py-2 text-xs">Create Invoice</button>
      </div>
    );
  };

  const renderHistoryCard = (item, idx) => (
    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-sky-700">{item.invoiceId}</p>
          <p className="text-xs text-gray-500">{item.orderId}</p>
          <p className="text-sm font-medium text-gray-700 mt-1">{item.customerName}</p>
          <p className="text-sm text-gray-600">{item.item}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={item.status} />
          <button onClick={() => downloadPDFManual(item)} className="text-sky-600 hover:text-sky-900 p-2 bg-sky-50 rounded-lg">
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
        <div><span className="font-medium text-gray-700">Sub:</span> ₹{item.subTotal}</div>
        <div><span className="font-medium text-gray-700">GST:</span> ₹{item.gst}</div>
        <div><span className="font-bold text-gray-900">₹{item.totalAmount}</span></div>
      </div>
    </div>
  );

  const statusOptions = activeTab === 'pending'
    ? [{ label: 'Pending', value: 'Pending' }]
    : [{ label: 'Invoiced', value: 'Invoiced' }];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-gray-200 rounded-xl shadow-sm">
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
        renderRow={(item, idx) => {
          if (activeTab === 'pending') {
            const { price, gst } = getInventoryPriceData(item.item || item.itemName);
            const calcs = calcInvoice(item.quantity, price, gst);
            return (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="font-medium text-gray-900">{item.orderId}</td>
                <td>{item.personName || item.customerName}</td>
                <td>{item.item || item.itemName}</td>
                <td className="font-bold">{item.quantity}</td>
                <td>₹{price}</td>
                <td>₹{calcs.sub}</td>
                <td className="text-gray-500">₹{calcs.gst} ({gst}%)</td>
                <td className="font-bold text-sky-600">₹{calcs.total}</td>
                <td><button onClick={() => openInvoice(item)} className="btn btn-primary px-3 py-1 text-xs">Create Invoice</button></td>
              </tr>
            );
          } else {
            return (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="font-medium text-gray-900">{item.invoiceId}</td>
                <td className="text-gray-500 text-xs">{item.orderId}</td>
                <td>{item.customerName}</td>
                <td>{item.item}</td>
                <td>₹{item.subTotal}</td>
                <td>₹{item.gst}</td>
                <td className="font-bold">₹{item.totalAmount}</td>
                <td className="text-xs">{new Date(item.invoiceDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => downloadPDFManual(item)} className="text-sky-600 hover:text-sky-900 p-1 bg-sky-50 rounded">
                    <Download size={16} />
                  </button>
                </td>
                <td><StatusBadge status={item.status} /></td>
              </tr>
            );
          }
        }}
        renderCard={activeTab === 'pending' ? renderPendingCard : renderHistoryCard}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Invoice Generation Confirmation">
        {invoiceConfig && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
              <div className="pb-2 font-mono text-xs">{invoiceConfig.invoiceId}</div>
              <div className="py-2"><strong>Customer:</strong> {invoiceConfig.customerName}</div>
              <div className="py-2 flex justify-between">
                <span><strong>Item:</strong> {invoiceConfig.item}</span>
                <span className="text-gray-500">{invoiceConfig.quantity}x @ ₹{invoiceConfig.unitPrice}</span>
              </div>
              <div className="pt-2 text-right space-y-1">
                <div>Sub Total: ₹{invoiceConfig.subTotal?.toFixed(2)}</div>
                <div>GST ({invoiceConfig.gstRate}%): ₹{invoiceConfig.gst?.toFixed(2)}</div>
                <div className="font-bold text-lg text-sky-700 mt-2">Grand Total: ₹{invoiceConfig.totalAmount?.toFixed(2)}</div>
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
