// src/data/dummyData.js
// Represents the global source of truth across all tables

export const initialData = [
  // Enquiries generated initially
  {
    orderId: 'ORD-1001',
    personName: 'Rahul Singh',
    personNumber: '9876543210',
    itemName: '4 inch water pump',
    quantity: 1,
    itemImage: 'pump.jpg',
    orderDate: new Date().toISOString(),
    status: 'PendingEnquiry', // PendingEnquiry, FollowUp, OrderReceive, OrderCancel, etc.
    nextDate: '',
    remarks: '',
    supplierName: '',
    cost: 0,
    expectedDelivery: '',
    receiveDate: '',
    invoiceTotal: 0,
    courierName: '',
    trackingNumber: '',
    dispatchDate: ''
  }
];

export const initialInventory = [
  { skuId: 'SKU-001', productName: '4 inch water pump', category: 'Pump', unitPrice: 4500, availableStock: 5 },
  { skuId: 'SKU-002', productName: 'John Deere Clutch Plate', category: 'Tractor Parts', unitPrice: 2100, availableStock: 0 },
];

export const initializeStorage = () => {
  if (!localStorage.getItem('portalData')) localStorage.setItem('portalData', JSON.stringify(initialData));
  if (!localStorage.getItem('inventoryData')) localStorage.setItem('inventoryData', JSON.stringify(initialInventory));
};

export const getStorageData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
export const setStorageData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
