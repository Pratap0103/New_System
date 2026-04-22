export const generateId = (prefix) => {
  return `${prefix}-${Math.floor(Date.now() / 1000)}`; 
};

export const calcInvoice = (qty, price, gstRate) => {
  const sub = Number(qty) * Number(price);
  const gst = sub * (Number(gstRate) / 100);
  const total = sub + gst;
  return { sub, gst, total };
};
