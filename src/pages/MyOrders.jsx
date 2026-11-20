import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';
import { formatMoney } from '../components/ProductCard';
import Icon from '../components/Icon';
import Loader from '../components/Loader';

export const statusLabel = { CONFIRMADO: 'Confirmado', EN_PREPARACION: 'En preparación', DESPACHADO: 'Despachado', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado' };
const FLOW = ['CONFIRMADO', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO'];

export function StatusPill({ status }) {
  return <span className={`status status-${status}`}>{statusLabel[status] || status}</span>;
}

function Track({ status }) {
  const at = FLOW.indexOf(status);
  return <ol className="track" aria-label={`Estado: ${statusLabel[status] || status}`}>
    {FLOW.map((step, i) => <li key={step} className={`${i <= at ? 'reached' : ''}${i === at ? ' now' : ''}`}>
      <span className="dot"><Icon name="check" size={13} /></span>{statusLabel[step]}
    </li>)}
  </ol>;
}

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getMyOrders().then(setOrders).catch((err) => setError(err.message)); }, []);

  return <section className="container pb-4" style={{ maxWidth: 880 }}>
    <header className="page-head">
      <p className="kicker"><Icon name="box" size={14} />Tu cuenta</p>
      <h1>Mis pedidos</h1>
      <p>Revisa el estado de tus compras y lo que incluye cada una.</p>
    </header>

    {error && <div className="alert alert-danger" role="alert"><Icon name="alert" />{error}</div>}
    {!orders && !error && <Loader label="Cargando tus pedidos…" />}
    {orders && !orders.length && <div className="empty">
      <div className="empty-art" aria-hidden="true">📦</div>
      <h2>Aún no tienes pedidos</h2>
      <p>Cuando compres algo, podrás seguir su estado aquí.</p>
      <Link className="btn btn-warm btn-lg" to="/categorias">Ir a la tienda<Icon name="arrow" size={18} /></Link>
    </div>}

    {orders?.map((order) => <article className="order" key={order.id}>
      <div className="order-head">
        <div>
          <h2>Pedido #{order.id}</h2>
          <div className="order-meta">
            <span><Icon name="clipboard" size={15} />{new Date(order.createdAt).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            <span><Icon name={order.customer.delivery === 'Retiro en veterinaria' ? 'home' : 'truck'} size={15} />{order.customer.delivery}</span>
          </div>
        </div>
        <StatusPill status={order.status} />
      </div>
      {order.status === 'CANCELADO'
        ? <p className="text-secondary my-3">Este pedido fue cancelado.</p>
        : <Track status={order.status} />}
      <div className="order-items">
        {order.items.map((item) => <div className="order-line" key={item.productId}><span>{item.quantity} × {item.name}</span><span>{formatMoney(item.subtotal)}</span></div>)}
        <div className="order-total"><span>Total</span><span>{formatMoney(order.total)}</span></div>
      </div>
    </article>)}
  </section>;
}
