import jsPDF from 'jspdf';
import { get } from './storage';

export const generateInvoicePDF = (invoiceData) => {
  const settings = get('jp_settings');
  const doc = new jsPDF();
  
  // Header section
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(settings.businessName || 'Business Name', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${settings.address1}, ${settings.city}, ${settings.state} - ${settings.pin}`, 14, 30);
  doc.text(`Phone: ${settings.phone} | Email: ${settings.email}`, 14, 35);
  doc.text(`GSTIN: ${settings.gstin}`, 14, 40);
  
  // Divider
  doc.setDrawColor(200);
  doc.line(14, 45, 196, 45);

  // Invoice Meta
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("TAX INVOICE", 14, 55);
  
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoiceData.invoiceId}`, 14, 65);
  doc.text(`Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString()}`, 14, 70);
  doc.text(`Order Ref: ${invoiceData.orderId}`, 14, 75);
  
  // Customer Details (Right side)
  doc.text("Billed To:", 120, 65);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.customerName, 120, 70);
  doc.setFont("helvetica", "normal");
  if(invoiceData.personNumber) doc.text(`Contact: ${invoiceData.personNumber}`, 120, 75);

  // Table Header
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(14, 85, 182, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.text("Item Name", 16, 92);
  doc.text("Qty", 100, 92);
  doc.text("Unit Price", 130, 92);
  doc.text("Total", 170, 92);

  // Table Row
  doc.setFont("helvetica", "normal");
  doc.text(invoiceData.item, 16, 102);
  doc.text(invoiceData.quantity.toString(), 100, 102);
  doc.text(`Rs. ${(invoiceData.subTotal / invoiceData.quantity).toFixed(2)}`, 130, 102);
  doc.text(`Rs. ${invoiceData.subTotal.toFixed(2)}`, 170, 102);

  // Totals Area
  doc.setDrawColor(200);
  doc.line(14, 115, 196, 115);
  
  doc.text("Sub Total:", 130, 125);
  doc.text(`Rs. ${invoiceData.subTotal.toFixed(2)}`, 170, 125);
  
  doc.text(`GST (${settings.defaultGst}%):`, 130, 132);
  doc.text(`Rs. ${invoiceData.gst.toFixed(2)}`, 170, 132);
  
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total:", 130, 142);
  doc.text(`Rs. ${invoiceData.totalAmount.toFixed(2)}`, 170, 142);

  doc.text("Payment Terms / Notes:", 14, 160);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceData.paymentTerms || "Thank you for your business.", 14, 168);

  // Download Action
  doc.save(`${invoiceData.invoiceId}.pdf`);
};
