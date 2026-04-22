import { get, save } from './storage';

const dummyData = {
  jp_enquiries: [
    ...Array.from({ length: 15 }).map((_, i) => ({
      enquiryId: `ENQ-00${i + 1}`,
      personName: ['Rahul Singh', 'Amit Patel', 'Vikas Sharma', 'Sunil Verma', 'Priya Reddy', 'Manish Gupta', 'Kunal Sen', 'Ravi Teja', 'Deepak Jha', 'Suresh Raina', 'Hardik Pandya', 'Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'KL Rahul'][i],
      personNumber: `+9198765432${10 + i}`,
      priority: ['High', 'Medium', 'Low'][i % 3],
      orderDate: new Date(Date.now() - i * 86400000).toISOString(),
      status: ['New', 'Follow Up', 'Order Received', 'Order Cancelled'][i % 4],
      remarks: `WhatsApp Summary for ${['Rahul Singh', 'Amit Patel', 'Vikas Sharma', 'Sunil Verma', 'Priya Reddy', 'Manish Gupta', 'Kunal Sen', 'Ravi Teja', 'Deepak Jha', 'Suresh Raina', 'Hardik Pandya', 'Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'KL Rahul'][i]}: Customer interested in tractor maintenance parts. Requested quotation for bulk order.`,
      items: [{ name: ['4 Inch Water Pump', 'John Deere Clutch Plate', 'Hydraulic Motor', 'Tractor Belt 80mm', 'Diesel Filter', 'Front Axle Bearing', 'Piston Ring Set', 'Heavy Duty Jack', 'Radiator Assembly', 'Fuel Injection Pump'][i % 10], qty: (i % 5) + 1 }],
      itemImage: i % 2 === 0 ? 'https://images.unsplash.com/photo-1590496885360-155728a4cdb5?w=200' : ''
    }))
  ],
  jp_orders: [
    ...Array.from({ length: 10 }).map((_, i) => ({
      orderId: `OR-10${i + 1}`,
      enquiryId: `ENQ-00${i + 1}`,
      personName: ['Arjun Kapoor', 'Sanjay Dutt', 'Salman Khan', 'Aamir Khan', 'Shah Rukh Khan', 'Hrithik Roshan', 'Ranbir Kapoor', 'Ranveer Singh', 'Varun Dhawan', 'Sid Malhotra'][i],
      personNumber: `+9199887766${10 + i}`,
      items: [{ name: 'Engine Oil 5L', qty: 2 }, { name: 'Oil Filter', qty: 1 }],
      orderDate: new Date(Date.now() - i * 3600000).toISOString(),
      status: ['Pending', 'Available', 'Not Available'][i % 3],
      priority: ['High', 'Medium', 'Low'][i % 3],
      deliveryDate: '2026-05-15',
      remarks: 'Standard delivery terms apply.'
    }))
  ],
  jp_inventory: [
    { skuId: 'SKU-001', productName: '4 Inch Water Pump', category: 'Pump', unitPrice: 4500, availableStock: 15, hsnCode: '8413', unit: 'pcs', gstRate: 18 },
    { skuId: 'SKU-002', productName: 'John Deere Clutch Plate', category: 'Tractor Parts', unitPrice: 2100, availableStock: 0, hsnCode: '8708', unit: 'pcs', gstRate: 18 },
    { skuId: 'SKU-003', productName: 'Hydraulic Motor', category: 'Motor', unitPrice: 12500, availableStock: 8, hsnCode: '8412', unit: 'pcs', gstRate: 18 },
    { skuId: 'SKU-004', productName: 'Diesel Filter', category: 'Filters', unitPrice: 350, availableStock: 2, hsnCode: '8421', unit: 'pcs', gstRate: 18 },
    { skuId: 'SKU-005', productName: 'Engine Oil 5L', category: 'Consumables', unitPrice: 1800, availableStock: 50, hsnCode: '2710', unit: 'btl', gstRate: 18 },
    { skuId: 'SKU-006', productName: 'Oil Filter', category: 'Filters', unitPrice: 450, availableStock: 30, hsnCode: '8421', unit: 'pcs', gstRate: 18 }
  ],
  jp_purchases: [
    ...Array.from({ length: 5 }).map((_, i) => ({
      orderId: `OR-10${i + 5}`,
      enquiryId: `ENQ-00${i + 5}`,
      personName: ['Shah Rukh Khan', 'Hrithik Roshan', 'Ranbir Kapoor', 'Ranveer Singh', 'Varun Dhawan'][i],
      itemName: 'Radiator Assembly',
      quantity: 10,
      supplierName: 'Auto Parts India',
      supplierContact: '9898989898',
      purchasePrice: 1500,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: '2026-04-30',
      status: i % 2 === 0 ? 'Purchased' : 'Pending'
    }))
  ],
  jp_receives: [
    ...Array.from({ length: 5 }).map((_, i) => ({
      orderId: `OR-10${i + 7}`,
      enquiryId: `ENQ-00${i + 7}`,
      itemName: 'Radiator Assembly',
      quantity: 5,
      supplierName: 'Global Tractors',
      expectedDeliveryDate: '2026-04-28',
      status: i % 2 === 0 ? 'Received' : 'Pending',
      receivedQty: i % 2 === 0 ? 5 : 0,
      receivedDate: i % 2 === 0 ? new Date().toISOString() : ''
    }))
  ],
  jp_assembles: [
    ...Array.from({ length: 10 }).map((_, i) => ({
      orderId: `ASM-70${i + 1}`,
      enquiryId: `ENQ-00${(i % 15) + 1}`,
      personName: ['Kabir Singh', 'Preeti Sikka', 'Raj Malhotara', 'Simran Kaur', 'Rahul Khanna', 'Anjali Sharma', 'Tina Malhotra', 'Vijay Deenanath', 'Chauhan Sahab', 'Bhuvan Lagaan'][i],
      items: [{ name: 'Brake Pad Set', qty: 2 }, { name: 'Brake Fluid', qty: 1 }],
      priority: ['High', 'Medium', 'Low'][i % 3],
      source: i % 2 === 0 ? 'Stock Check' : 'Purchase',
      status: i < 5 ? 'Pending' : 'Assembled',
      assembledAt: i >= 5 ? new Date(Date.now() - (i-5) * 86400000).toISOString() : ''
    }))
  ],
  jp_invoices: [
    ...Array.from({ length: 5 }).map((_, i) => ({
      invoiceId: `INV-80${i + 1}`,
      orderId: `ASM-70${i + 6}`,
      enquiryId: `ENQ-00${i + 6}`,
      customerName: ['Anjali Sharma', 'Tina Malhotra', 'Vijay Deenanath', 'Chauhan Sahab', 'Bhuvan Lagaan'][i],
      items: [{ name: 'Brake Pad Set', qty: 2 }, { name: 'Brake Fluid', qty: 1 }],
      totalAmount: 3500 + i * 500,
      invoiceDate: new Date().toISOString(),
      status: i % 2 === 0 ? 'Invoiced' : 'Pending'
    }))
  ],
  jp_dispatches: [
    ...Array.from({ length: 5 }).map((_, i) => ({
      dispatchId: `DIS-90${i + 1}`,
      invoiceId: `INV-80${i + 1}`,
      orderId: `ASM-70${i + 6}`,
      enquiryId: `ENQ-00${i + 6}`,
      personName: ['Anjali Sharma', 'Tina Malhotra', 'Vijay Deenanath', 'Chauhan Sahab', 'Bhuvan Lagaan'][i],
      items: [{ name: 'Brake Pad Set', qty: 2 }, { name: 'Brake Fluid', qty: 1 }],
      transportName: 'VRL Logistics',
      vehicleNumber: `MH-12-AB-${1000 + i}`,
      dispatchDate: new Date().toISOString(),
      status: i % 2 === 0 ? 'Dispatched' : 'Pending',
      totalAmount: 3500 + i * 500
    }))
  ],
  jp_master: [
    { skuId: 'SKU-001', productName: '4 Inch Water Pump', category: 'Pump', hsnCode: '8413', unit: 'pcs', purchasePrice: 3800, sellingPrice: 4500, gstRate: 18, openingStock: 15 },
    { skuId: 'SKU-002', productName: 'John Deere Clutch Plate', category: 'Tractor Parts', hsnCode: '8708', unit: 'pcs', purchasePrice: 1800, sellingPrice: 2100, gstRate: 18, openingStock: 0 }
  ],
  jp_settings: {
    businessName: 'Jhabka Tractor Portal',
    gstin: '08AAAAA0000A1Z5',
    address1: '123 Market Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    phone: '+91 9876543210',
    email: 'contact@jhabka.com',
    defaultGst: 18,
    invoicePrefix: 'INV-'
  }
};

export const initializeDummyData = () => {
  Object.keys(dummyData).forEach((key) => {
    save(key, dummyData[key]);
  });
};
