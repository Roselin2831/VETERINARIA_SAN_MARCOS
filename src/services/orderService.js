import { api } from './api';

// Solo se envían id y cantidad: el backend calcula precios y total.
export const createOrder = (customer, cart) =>
  api('/orders', {
    method: 'POST',
    body: { ...customer, items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) }
  });

export const getMyOrders = () => api('/orders/mine');
export const getOrder = (id) => api(`/orders/${id}`);
export const getAllOrders = () => api('/orders');
export const updateOrderStatus = (id, status) => api(`/orders/${id}/status`, { method: 'PATCH', body: { status } });
