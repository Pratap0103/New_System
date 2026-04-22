export const get = (key) => JSON.parse(localStorage.getItem(key) || '[]');

export const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const updateStatus = (key, idField, id, newStatus, additionalFields = {}) => {
  const data = get(key);
  const updated = data.map(item => 
    item[idField] === id ? { ...item, status: newStatus, ...additionalFields } : item
  );
  save(key, updated);
  return updated;
};
