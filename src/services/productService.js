import { api } from './api';

export const getProducts = () => api('/products', { auth: false });
export const getCategories = () => api('/categories', { auth: false });
export const createProduct = (product) => api('/products', { method: 'POST', body: toPayload(product) });
export const updateProduct = (id, product) => api(`/products/${id}`, { method: 'PUT', body: toPayload(product) });
export const deleteProduct = (id) => api(`/products/${id}`, { method: 'DELETE' });

const toPayload = (p) => ({
  name: p.name,
  category: p.category,
  price: Number(p.price),
  stock: Number(p.stock),
  offer: Boolean(p.offer),
  description: p.description,
  emoji: p.emoji
});
