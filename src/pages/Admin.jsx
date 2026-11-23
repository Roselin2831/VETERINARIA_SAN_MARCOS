import { useCallback, useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { createProduct, deleteProduct, updateProduct } from '../services/productService';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import { getUsers, updateUserRole } from '../services/userService';
import { formatMoney, toneFor } from '../components/ProductCard';
import Icon from '../components/Icon';
import ProductImage from '../components/ProductImage';
import { PRODUCT_PHOTOS } from '../data/photos';
import { statusLabel } from './MyOrders';

const blank = { name: '', category: 'Alimentos', price: '', stock: '', offer: false, description: '', emoji: '🐾', imageUrl: '' };
const EMOJIS = ['🐾', '🐶', '🐱', '🐰', '🦜', '🦴', '🥩', '🧴', '🛁', '💊', '💉', '🧸'];
const LOW_STOCK = 5;

// Esta página solo se monta si ProtectedRoute confirmó rol ADMIN.
// Aun así, cada llamada lleva el JWT y el backend vuelve a verificar el rol (doble capa).
export default function Admin() {
  const { products, refreshProducts } = useShop(); const { user } = useAuth();
  const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null);
  const [orders, setOrders] = useState([]); const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('productos');

  const loadAdminData = useCallback(async () => {
    try { const [o, u] = await Promise.all([getAllOrders(), getUsers()]); setOrders(o); setUsers(u); }
    catch (err) { setError(err.message); }
  }, []);
  useEffect(() => { loadAdminData(); }, [loadAdminData]);

  const run = async (action, okMessage) => {
    setError(''); setNotice('');
    try { await action(); setNotice(okMessage); return true; } catch (err) { setError(err.message); return false; }
  };

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    const ok = await run(() => editing ? updateProduct(editing, form) : createProduct(form), editing ? 'Producto actualizado.' : 'Producto creado.');
    if (ok) { await refreshProducts(); setForm(blank); setEditing(null); }
    setSaving(false);
  };
  const edit = (product) => { setTab('productos'); setEditing(product.id); setForm({ ...product, imageUrl: product.imageUrl || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const cancelEdit = () => { setEditing(null); setForm(blank); };
  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    if (await run(() => deleteProduct(id), 'Producto eliminado.')) refreshProducts();
  };
  const changeStatus = async (id, status) => {
    if (await run(() => updateOrderStatus(id, status), `Pedido #${id} actualizado.`)) { loadAdminData(); refreshProducts(); }
  };
  const changeRole = async (id, role) => {
    if (await run(() => updateUserRole(id, role), 'Rol actualizado.')) loadAdminData();
  };

  const sales = orders.filter((o) => o.status !== 'CANCELADO').reduce((sum, o) => sum + Number(o.total || 0), 0);
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK).length;
  const stats = [
    { icon: 'box', tone: 'tone-sage', value: products.length, label: 'Productos' },
    { icon: 'clipboard', tone: 'tone-mustard', value: orders.length, label: 'Pedidos' },
    { icon: 'tag', tone: 'tone-blush', value: formatMoney(sales), label: 'Ventas' },
    { icon: 'alert', tone: lowStock ? 'tone-blush' : 'tone-sand', value: lowStock, label: `Stock ≤ ${LOW_STOCK}` }
  ];
  const tabs = [
    { id: 'productos', label: 'Productos', count: products.length, icon: 'box' },
    { id: 'pedidos', label: 'Pedidos', count: orders.length, icon: 'clipboard' },
    { id: 'usuarios', label: 'Usuarios', count: users.length, icon: 'users' }
  ];

  return <section className="container pb-4">
    <header className="page-head">
      <p className="kicker"><Icon name="shield" size={14} />Panel administrativo</p>
      <h1>Gestión de tienda</h1>
      <p>Hola, {user.name.split(' ')[0]}. Administra productos, pedidos y usuarios desde aquí.</p>
    </header>

    <div className="stats">
      {stats.map((s) => <div className={`stat ${s.tone}`} key={s.label}>
        <span className="stat-icon"><Icon name={s.icon} size={24} /></span>
        <div><b>{s.value}</b><span>{s.label}</span></div>
      </div>)}
    </div>

    {notice && <div className="alert alert-success" role="status"><Icon name="check" />{notice}</div>}
    {error && <div className="alert alert-danger" role="alert"><Icon name="alert" />{error}</div>}

    <div className="tabs" role="tablist" aria-label="Secciones del panel">
      {tabs.map((t) => <button key={t.id} id={`tab-${t.id}`} className="tab" role="tab" type="button" aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}>
        <Icon name={t.icon} size={16} />{t.label}<span className="count">{t.count}</span>
      </button>)}
    </div>

    {tab === 'productos' && <div className="row g-4" role="tabpanel" id="panel-productos" aria-labelledby="tab-productos">
      <div className="col-lg-4">
        <form className="panel" onSubmit={submit}>
          <h2 className="panel-title"><span className="n"><Icon name={editing ? 'edit' : 'plus'} size={16} /></span>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <div className="mb-3"><label className="form-label" htmlFor="ad-name">Nombre</label><input id="ad-name" className="form-control" required name="name" value={form.name} onChange={change} /></div>
          <div className="mb-3"><label className="form-label" htmlFor="ad-cat">Categoría</label><select id="ad-cat" className="form-select" name="category" value={form.category} onChange={change}><option>Alimentos</option><option>Higiene</option><option>Salud</option></select></div>
          <div className="row g-2 mb-3">
            <div className="col"><label className="form-label" htmlFor="ad-price">Precio</label><input id="ad-price" className="form-control" required min="0" type="number" name="price" value={form.price} onChange={change} /></div>
            <div className="col"><label className="form-label" htmlFor="ad-stock">Stock</label><input id="ad-stock" className="form-control" required min="0" type="number" name="stock" value={form.stock} onChange={change} /></div>
          </div>
          <div className="mb-3">
            <span className="form-label d-block" id="ad-photo-label">Foto</span>
            <div className="photo-pick mb-2" role="group" aria-labelledby="ad-photo-label">
              <button type="button" className="none" aria-pressed={!form.imageUrl} onClick={() => setForm({ ...form, imageUrl: '' })}>Sin foto</button>
              {PRODUCT_PHOTOS.map((p) => <button key={p.src} type="button" aria-pressed={form.imageUrl === p.src} aria-label={p.label} title={p.label} onClick={() => setForm({ ...form, imageUrl: p.src })}>
                <img src={p.src} alt="" loading="lazy" />
              </button>)}
            </div>
            <input className="form-control" name="imageUrl" type="text" inputMode="url" aria-label="URL de la foto" placeholder="o pega una URL https://…" value={form.imageUrl} onChange={change} />
            <small className="text-secondary d-block mt-1">Si no hay foto, se muestra el ícono.</small>
          </div>
          <div className="mb-3">
            <span className="form-label d-block" id="ad-emoji-label">Ícono</span>
            <div className="emoji-pick mb-2" role="group" aria-labelledby="ad-emoji-label">
              {EMOJIS.map((e) => <button key={e} type="button" aria-pressed={form.emoji === e} aria-label={`Usar ${e}`} onClick={() => setForm({ ...form, emoji: e })}>{e}</button>)}
            </div>
            <input className="form-control" name="emoji" maxLength="4" aria-label="Otro emoji" placeholder="u otro emoji" value={form.emoji} onChange={change} />
          </div>
          <div className="mb-3"><label className="form-label" htmlFor="ad-desc">Descripción</label><textarea id="ad-desc" className="form-control" rows="3" required name="description" value={form.description} onChange={change} /></div>
          <div className="form-check form-switch mb-4"><input className="form-check-input" id="offer" type="checkbox" role="switch" name="offer" checked={form.offer} onChange={change} /><label className="form-check-label fw-bold ms-1" htmlFor="offer">Está en oferta</label></div>
          <div className="d-flex gap-2">
            <button className="btn btn-warm flex-grow-1" type="submit" disabled={saving}>{saving ? 'Guardando…' : editing ? 'Actualizar' : 'Crear producto'}</button>
            {editing && <button className="btn btn-soft" onClick={cancelEdit} type="button">Cancelar</button>}
          </div>
        </form>
      </div>
      <div className="col-lg-8">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th><span className="visually-hidden">Acciones</span></th></tr></thead>
            <tbody>{products.map((product) => <tr key={product.id} className={editing === product.id ? 'editing' : ''}>
              <td><div className={`prod-cell ${toneFor(product.category)}`}><ProductImage product={product} className="thumb sm" /><span>{product.name}<small>{product.category}{product.offer && <> · <span className="pill offer">Oferta</span></>}</small></span></div></td>
              <td className="text-nowrap fw-bold">{formatMoney(product.price)}</td>
              <td><span className={`pill ${product.stock <= LOW_STOCK ? 'low' : 'ok'}`}>{product.stock}</span></td>
              <td className="text-nowrap text-end">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => edit(product)} aria-label={`Editar ${product.name}`}><Icon name="edit" size={15} />Editar</button>
                <button className="btn btn-danger-soft btn-sm" type="button" onClick={() => remove(product.id)} aria-label={`Eliminar ${product.name}`}><Icon name="trash" size={15} /></button>
              </td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>}

    {tab === 'pedidos' && <div className="panel" role="tabpanel" id="panel-pedidos" aria-labelledby="tab-pedidos">
      {orders.length ? <div className="row-list">{orders.map((order) => <div key={order.id}>
        <span className="grow"><b>#{order.id} · {order.customer.name}</b><small>{new Date(order.createdAt).toLocaleDateString('es-CL')} · {order.customer.delivery} · {order.items?.length || 0} {order.items?.length === 1 ? 'producto' : 'productos'}</small></span>
        <span className="amount">{formatMoney(order.total)}</span>
        <span className={`status status-${order.status}`} aria-hidden="true" />
        <select className="form-select form-select-sm w-auto" aria-label={`Estado del pedido ${order.id}`} value={order.status} disabled={['CANCELADO', 'ENTREGADO'].includes(order.status)} onChange={(e) => changeStatus(order.id, e.target.value)}>
          {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>)}</div> : <div className="empty py-4"><div className="empty-art" aria-hidden="true">📋</div><h2>Aún no hay pedidos</h2><p>Los pedidos de los clientes aparecerán aquí.</p></div>}
    </div>}

    {tab === 'usuarios' && <div className="panel" role="tabpanel" id="panel-usuarios" aria-labelledby="tab-usuarios">
      <div className="row-list">{users.map((u) => <div key={u.id}>
        <span className={`avatar${u.role === 'ADMIN' ? ' admin' : ''}`} aria-hidden="true">{u.name.charAt(0).toUpperCase()}</span>
        <span className="grow"><b>{u.name}{u.id === user.id && <span className="text-secondary fw-normal"> (tú)</span>}</b><small>{u.email}</small></span>
        <select className="form-select form-select-sm w-auto" aria-label={`Rol de ${u.name}`} value={u.role} disabled={u.id === user.id} onChange={(e) => changeRole(u.id, e.target.value)}>
          <option value="CLIENTE">CLIENTE</option><option value="VENDEDOR">VENDEDOR</option><option value="ADMIN">ADMIN</option>
        </select>
      </div>)}</div>
    </div>}
  </section>;
}
