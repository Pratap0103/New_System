import React, { useState, useEffect } from 'react';
import { get, save } from '../utils/storage';
import { generateId, calcInvoice } from '../utils/helpers';
import { generateInvoicePDF } from '../utils/InvoicePDF';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PopupModal from '../components/PopupModal';
import { Download } from 'lucide-react';

const Invoices = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [invoiceConfig, setInvoiceConfig] = useState(null);

  useEffect(() => {
    setData(get('jp_invoices'));
  }, []);

  const pendingData = data.filter(d => !d.status || d.status === 'Pending');
  const historyData = data.filter(d => d.status === 'Invoiced');

  const getInventoryPriceData = (itemName) => {
    const invData = get('jp_inventory');
    const matched = invData.find(i => itemName.includes(i.productName) || i.productName.includes(itemName));
    if (matched) return { price: matched.unitPrice, gst: matched.gstRate };
    return { price: 2000, gst: 18 }; // fallback mock
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
    // 1. Generate local jsPDF
    generateInvoicePDF(invoiceConfig);

    // 2. Update status and push to dispatch
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
    // For historical downloads, reconstruct the payload
    const { price, gst } = getInventoryPriceData(item.item);
    generateInvoicePDF({
      ...item,
      invoiceId: item.invoiceId || 'N/A',
      quantity: item.quantity,
      unitPrice: price,
      subTotal: item.subTotal,
      gst: item.gst,
      totalAmount: item.totalAmount
    });
  };

  const columnsPending = ['Order ID', 'Person Name', 'Item Name', 'Qty', 'Unit Price', 'Sub Total', 'GST', 'Total Amount', 'Action'];
  const columnsHistory = ['Invoice ID', 'Order ID', 'Customer Name', 'Item', 'Sub Total', 'GST', 'Total Amount', 'Invoice Date', 'PDF', 'Status'];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Invoices & Billing</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('pending')}>
            Ready to Invoice ({pendingData.length})
          </button>
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('history')}>
            Archived Invoices
          </button>
        </div>
      </div>

      <DataTable 
        columns={activeTab === 'pending' ? columnsPending : columnsHistory}
        data={activeTab === 'pending' ? pendingData : historyData}
        renderRow={(item, idx) => {
          if(activeTab === 'pending') {
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
                <td className="font-bold text-indigo-600">₹{calcs.total}</td>
                <td>
                  <button onClick={() => openInvoice(item)} className="btn btn-primary px-3 py-1 text-xs">Create Invoice</button>
                </td>
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
                  <button onClick={() => downloadPDFManual(item)} className="text-indigo-600 hover:text-indigo-900 p-1 bg-indigo-50 rounded">
                    <Download size={16} />
                  </button>
                </td>
                <td><StatusBadge status={item.status} /></td>
              </tr>
             );
          }
        }}
      />

      <PopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Invoice Generation Confirmation">
        {invoiceConfig && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 divide-y divide-gray-200 border border-gray-200">
               <div className="pb-2 font-mono text-xs">{invoiceConfig.invoiceId}</div>
               <div className="py-2 flex justify-between"><span><strong>Customer:</strong> {invoiceConfig.customerName}</span></div>
               <div className="py-2 flex justify-between">
                 <span><strong>Item Breakdown:</strong> {invoiceConfig.item}</span> 
                 <span>{invoiceConfig.quantity}x @ ₹{invoiceConfig.unitPrice}</span>
               </div>
               <div className="pt-2 text-right space-y-1">
                 <div>Sub Total: ₹{invoiceConfig.subTotal.toFixed(2)}</div>
                 <div>GST ({invoiceConfig.gstRate}%): ₹{invoiceConfig.gst.toFixed(2)}</div>
                 <div className="font-bold text-lg text-indigo-700 mt-2">Grand Total: ₹{invoiceConfig.totalAmount.toFixed(2)}</div>
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
