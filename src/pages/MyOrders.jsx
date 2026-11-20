import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';
import { formatMoney } from '../components/ProductCard';
export const statusLabel = { CONFIRMADO: 'Confirmado', EN_PREPARACION: 'En preparación', DESPACHADO: 'Despachado', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado' };
export default function MyOrders() {
  const [orders, setOrders] = useState(null); const [error, setError] = useState('');
  useEffect(() => { getMyOrders().then(setOrders).catch((err) => setError(err.message)); }, []);
  return <section className="container py-5"><h1 className="serif">Mis pedidos</h1>{error && <div className="alert alert-danger">{error}</div>}{!orders && !error && <div className="spinner-border text-success" role="status" />}{orders && !orders.length && <p className="text-secondary">Aún no tienes pedidos. <Link to="/categorias">Ir a la tienda</Link></p>}{orders?.map((order) => <div className="card border-0 shadow-sm mb-3" key={order.id}><div className="card-body"><div className="d-flex justify-content-between flex-wrap gap-2"><strong>Pedido #{order.id}</strong><span className={`badge ${order.status === 'CANCELADO' ? 'text-bg-secondary' : 'text-bg-success'}`}>{statusLabel[order.status] || order.status}</span></div><p className="small text-secondary mb-2">{new Date(order.createdAt).toLocaleString('es-CL')} · {order.customer.delivery}</p>{order.items.map((item) => <div className="d-flex justify-content-between small" key={item.productId}><span>{item.quantity} × {item.name}</span><span>{formatMoney(item.subtotal)}</span></div>)}<div className="d-flex justify-content-between border-top pt-2 mt-2"><strong>Total</strong><strong>{formatMoney(order.total)}</strong></div></div></div>)}</section>;
}
