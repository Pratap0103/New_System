import { get, save } from './storage';

const dummyData = {
  jp_enquiries: [
    { orderId: 'ENQ-1718000001', personName: 'Rahul Singh', personNumber: '+919876543210', itemName: '4 Inch Water Pump', quantity: 2, itemImage: 'pump.jpg', orderDate: '2026-04-20T10:00:00Z', status: 'Pending' },
    { orderId: 'ENQ-1718000002', personName: 'Amit Patel', personNumber: '+919876543211', itemName: 'John Deere Clutch Plate', quantity: 1, itemImage: 'clutch.jpg', orderDate: '2026-04-20T11:30:00Z', status: 'Follow Up', nextDate: '2026-04-25', remarks: 'Customer wants a discount.' },
    { orderId: 'ENQ-1718000003', personName: 'Vikas Sharma', personNumber: '+919876543212', itemName: 'Hydraulic Motor', quantity: 3, itemImage: 'motor.jpg', orderDate: '2026-04-21T09:15:00Z', status: 'Order Received' },
    { orderId: 'ENQ-1718000004', personName: 'Sunil Verma', personNumber: '+919876543213', itemName: 'Tractor Belt 80mm', quantity: 5, itemImage: 'belt.jpg', orderDate: '2026-04-21T14:45:00Z', status: 'Pending' },
    { orderId: 'ENQ-1718000005', personName: 'Priya Reddy', personNumber: '+919876543214', itemName: 'Diesel Filter', quantity: 10, itemImage: 'filter.jpg', orderDate: '2026-04-22T08:20:00Z', status: 'Order Received' },
    { orderId: 'ENQ-1718000006', personName: 'Rajesh Kumar', personNumber: '+919876543215', itemName: 'Front Axle Bearing', quantity: 4, itemImage: 'bearing.jpg', orderDate: '2026-04-22T09:10:00Z', status: 'Order Cancelled', remarks: 'Too expensive' }
  ],
  jp_orders: [
    { orderId: 'ENQ-1718000003', personName: 'Vikas Sharma', personNumber: '+919876543212', itemName: 'Hydraulic Motor', quantity: 3, itemImage: 'motor.jpg', orderDate: '2026-04-21T09:15:00Z', status: 'Available' },
    { orderId: 'ENQ-1718000005', personName: 'Priya Reddy', personNumber: '+919876543214', itemName: 'Diesel Filter', quantity: 10, itemImage: 'filter.jpg', orderDate: '2026-04-22T08:20:00Z', status: 'Not Available' },
    { orderId: 'ENQ-1718000007', personName: 'Anil Desai', personNumber: '+919876543216', itemName: 'Piston Ring Set', quantity: 2, itemImage: 'ring.jpg', orderDate: '2026-04-22T10:05:00Z', status: 'Pending' },
    { orderId: 'ENQ-1718000008', personName: 'Mukesh Ambani', personNumber: '+919876543217', itemName: 'Heavy Duty Jack', quantity: 1, itemImage: 'jack.jpg', orderDate: '2026-04-22T10:30:00Z', status: 'Pending' }
  ],
  jp_inventory: [
    { skuId: 'SKU-001', productName: '4 Inch Water Pump', category: 'Pump', unitPrice: 4500, availableStock: 15, hsnCode: '8413', unit: 'pcs', gstRate: 18 },
    { skuId: 'SKU-002', productName: 'John Deere Clutch Plate', category: 'Tractor Parts', unitPrice: 2100, availableStock: 0, hsnCode: '8708', unit: 'pcs', gstRate: 18 },
    { skuId: 'SKU-003', productName: 'Hydraulic Motor', category: 'Motor', unitPrice: 12500, availableStock: 8, hsnCode: '8412', unit: 'pcs', gstRate: 18 },
    { skuId: 'SKU-004', productName: 'Diesel Filter', category: 'Filters', unitPrice: 350, availableStock: 2, hsnCode: '8421', unit: 'pcs', gstRate: 18 },
    { skuId: 'SKU-005', productName: 'Bearing 6204', category: 'Bearings', unitPrice: 150, availableStock: 100, hsnCode: '8482', unit: 'pcs', gstRate: 18 }
  ],
  jp_purchases: [
    { orderId: 'ENQ-1718000005', itemName: 'Diesel Filter', quantity: 10, supplierName: 'Auto Parts India', supplierContact: '9898989898', purchasePrice: 200, orderDate: '2026-04-22T08:30:00Z', expectedDeliveryDate: '2026-04-23', status: 'Purchased' },
    { orderId: 'ORD-1718000101', itemName: 'Bearing 6204', quantity: 50, supplierName: 'Delhi Auto', supplierContact: '9988776655', purchasePrice: 120, orderDate: '2026-04-18T09:00:00Z', expectedDeliveryDate: '2026-04-20', status: 'Purchased' },
    { orderId: 'ORD-1718000102', itemName: 'John Deere Clutch Plate', quantity: 5, status: 'Pending' }
  ],
  jp_receives: [
    { orderId: 'ENQ-1718000005', itemName: 'Diesel Filter', quantity: 10, supplierName: 'Auto Parts India', expectedDeliveryDate: '2026-04-23', status: 'Pending' },
    { orderId: 'ORD-1718000101', itemName: 'Bearing 6204', quantity: 50, supplierName: 'Delhi Auto', expectedDeliveryDate: '2026-04-20', status: 'Received', receivedQty: 50, receivedDate: '2026-04-20', condition: 'Good', receivedBy: 'Admin' }
  ],
  jp_invoices: [
    { orderId: 'ENQ-1718000003', personName: 'Vikas Sharma', item: 'Hydraulic Motor', quantity: 3, status: 'Pending' },
    { invoiceId: 'INV-1718000100', orderId: 'OLD-001', customerName: 'Suresh Kumar', item: 'Tractor Belt 80mm', quantity: 2, subTotal: 1000, gst: 180, totalAmount: 1180, invoiceDate: '2026-04-19T10:00:00Z', status: 'Invoiced' },
    { invoiceId: 'INV-1718000101', orderId: 'OLD-002', customerName: 'Kishore Traders', item: 'Bearing 6204', quantity: 10, subTotal: 2500, gst: 450, totalAmount: 2950, invoiceDate: '2026-04-21T11:00:00Z', status: 'Invoiced' }
  ],
  jp_dispatches: [
    { invoiceId: 'INV-1718000100', orderId: 'OLD-001', personName: 'Suresh Kumar', itemName: 'Tractor Belt 80mm', quantity: 2, totalAmount: 1180, status: 'Pending' },
    { dispatchId: 'DIS-1718000200', invoiceId: 'INV-1718000101', orderId: 'OLD-002', personName: 'Kishore Traders', itemName: 'Bearing 6204', quantity: 10, transportName: 'VRL Logistics', vehicleNumber: 'MH 12 AB 1234', dispatchDate: '2026-04-22', estimatedDeliveryDate: '2026-04-24', status: 'Dispatched' }
  ],
  jp_master: [
    { skuId: 'SKU-001', productName: '4 Inch Water Pump', category: 'Pump', hsnCode: '8413', unit: 'pcs', purchasePrice: 3800, sellingPrice: 4500, gstRate: 18, openingStock: 15 },
    { skuId: 'SKU-002', productName: 'John Deere Clutch Plate', category: 'Tractor Parts', hsnCode: '8708', unit: 'pcs', purchasePrice: 1800, sellingPrice: 2100, gstRate: 18, openingStock: 0 },
    { skuId: 'SKU-003', productName: 'Hydraulic Motor', category: 'Motor', hsnCode: '8412', unit: 'pcs', purchasePrice: 10500, sellingPrice: 12500, gstRate: 18, openingStock: 8 },
    { skuId: 'SKU-004', productName: 'Diesel Filter', category: 'Filters', hsnCode: '8421', unit: 'pcs', purchasePrice: 200, sellingPrice: 350, gstRate: 18, openingStock: 2 },
    { skuId: 'SKU-005', productName: 'Bearing 6204', category: 'Bearings', hsnCode: '8482', unit: 'pcs', purchasePrice: 120, sellingPrice: 250, gstRate: 18, openingStock: 100 }
  ],
  jp_settings: {
    businessName: 'Jhabka Tractor Portal',
    gstin: '08AAAAA0000A1Z5',
    address1: '123 Market Road',
    address2: 'Near Bus Stand',
    city: 'Jaipur',
    state: 'Rajasthan',
    pin: '302001',
    phone: '+91 9876543210',
    email: 'contact@jhabka.com',
    defaultGst: 18,
    invoicePrefix: 'INV-'
  }
};

export const initializeDummyData = () => {
  // We force reset the data if this function runs, allowing the user to see the fresh 15 rows dummy set immediately.
  Object.keys(dummyData).forEach((key) => {
    // Check if empty or override flag is set (for this demo wipe and re-seed to guarantee UI updates)
    if (!localStorage.getItem(key) || JSON.parse(localStorage.getItem(key)).length === 0) {
      save(key, dummyData[key]);
    }
  });
};
