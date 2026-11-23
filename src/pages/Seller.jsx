import { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { getAllOrders, getOrder } from '../services/orderService';
import { formatMoney } from '../components/ProductCard';
import { StatusPill } from './MyOrders';
import Loader from '../components/Loader';

export default function Seller() {
  const { products, loadingProducts, productsError } = useShop();
  const [tab, setTab] = useState('productos');
  const [orders, setOrders] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { getAllOrders().then(setOrders).catch(err => setError(err.message)); }, []);
  const detail = async (id) => {
    setError(''); setBusy(true);
    try { setSelected(await getOrder(id)); } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <section className="container pb-4">
    <header className="page-head"><p className="kicker">Panel de vendedor</p><h1>Productos y pedidos</h1><p>Consulta el catálogo, las existencias y el detalle de los pedidos.</p></header>
    {(error || productsError) && <div className="alert alert-danger" role="alert">{error || productsError}</div>}
    <div className="tabs" role="tablist" aria-label="Consultas">
      {['productos', 'pedidos'].map(value => <button key={value} id={`seller-${value}`} role="tab" aria-selected={tab === value} aria-controls={`seller-panel-${value}`} className="tab" onClick={() => { setTab(value); setSelected(null); }}>{value === 'productos' ? 'Productos' : 'Pedidos'}</button>)}
    </div>
    {tab === 'productos' && <div role="tabpanel" id="seller-panel-productos" aria-labelledby="seller-productos">
      {loadingProducts ? <Loader /> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Detalle</th></tr></thead>
        <tbody>{products.map(product => <tr key={product.id}><td>{product.name}</td><td>{product.category}</td><td>{formatMoney(product.price)}</td><td>{product.stock}</td><td><details><summary>Ver detalle de {product.name}</summary><p>{product.description}</p><p>{product.offer ? 'En oferta' : 'Precio normal'}</p></details></td></tr>)}</tbody>
      </table></div>}
    </div>}
    {tab === 'pedidos' && <div role="tabpanel" id="seller-panel-pedidos" aria-labelledby="seller-pedidos">
      {!orders && !error && <Loader />}
      {orders?.length === 0 && <p>Aún no hay pedidos.</p>}
      {orders?.length > 0 && <div className="table-wrap"><table className="data-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td>#{order.id}</td><td>{order.customer.name}</td><td>{formatMoney(order.total)}</td><td><StatusPill status={order.status} /></td><td><button className="btn btn-soft btn-sm" disabled={busy} onClick={() => detail(order.id)}>Ver pedido #{order.id}</button></td></tr>)}</tbody></table></div>}
      {selected && <article className="panel mt-4" aria-label={`Detalle del pedido ${selected.id}`}>
        <h2>Pedido #{selected.id}</h2><p>{selected.customer.name} · {selected.customer.email}</p><p>{selected.customer.address} · {selected.customer.delivery}</p><p>Medio de pago: {selected.customer.payment}</p>
        {selected.items.map(item => <p key={item.productId}>{item.quantity} × {item.name}: {formatMoney(item.subtotal)}</p>)}
        <p><strong>Total: {formatMoney(selected.total)}</strong></p><StatusPill status={selected.status} />
      </article>}
    </div>}
  </section>;
}
