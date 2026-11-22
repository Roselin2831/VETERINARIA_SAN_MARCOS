import { useCallback, useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { createProduct, deleteProduct, updateProduct } from '../services/productService';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import { getUsers, updateUserRole } from '../services/userService';
import { formatMoney } from '../components/ProductCard';
import { statusLabel } from './MyOrders';

const blank = { name: '', category: 'Alimentos', price: '', stock: '', offer: false, description: '', emoji: '🐾' };

// Esta página solo se monta si ProtectedRoute confirmó rol ADMIN.
// Aun así, cada llamada lleva el JWT y el backend vuelve a verificar el rol (doble capa).
export default function Admin() {
  const { products, refreshProducts } = useShop(); const { user } = useAuth();
  const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null);
  const [orders, setOrders] = useState([]); const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);

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
  const edit = (product) => { setEditing(product.id); setForm(product); window.scrollTo({ top: 0, behavior: 'smooth' }); };
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

  return <section className="container py-5"><div className="d-flex justify-content-between align-items-end flex-wrap gap-2"><div><p className="text-success fw-bold text-uppercase small">Panel administrativo</p><h1 className="serif">Gestión de tienda</h1></div><span className="badge text-bg-success px-3 py-2">{products.length} productos · {orders.length} pedidos · {users.length} usuarios</span></div>
    {notice && <div className="alert alert-success small mt-3">{notice}</div>}{error && <div className="alert alert-danger small mt-3">{error}</div>}
    <div className="row g-4 mt-1"><div className="col-lg-4"><div className="card border-0 shadow-sm"><div className="card-body"><h2 className="h5">{editing ? 'Editar producto' : 'Nuevo producto'}</h2><form onSubmit={submit}><input className="form-control mb-2" required name="name" placeholder="Nombre" value={form.name} onChange={change} /><select className="form-select mb-2" name="category" value={form.category} onChange={change}><option>Alimentos</option><option>Higiene</option><option>Salud</option></select><div className="row g-2"><div className="col"><input className="form-control" required min="0" type="number" name="price" placeholder="Precio" value={form.price} onChange={change} /></div><div className="col"><input className="form-control" required min="0" type="number" name="stock" placeholder="Stock" value={form.stock} onChange={change} /></div></div><input className="form-control my-2" name="emoji" maxLength="4" placeholder="Emoji" value={form.emoji} onChange={change} /><textarea className="form-control mb-2" required name="description" placeholder="Descripción" value={form.description} onChange={change} /><div className="form-check mb-3"><input className="form-check-input" id="offer" type="checkbox" name="offer" checked={form.offer} onChange={change} /><label className="form-check-label" htmlFor="offer">Está en oferta</label></div><div className="d-flex gap-2"><button className="btn btn-success" type="submit" disabled={saving}>{editing ? 'Actualizar' : 'Crear producto'}</button>{editing && <button className="btn btn-outline-secondary" onClick={() => { setEditing(null); setForm(blank); }} type="button">Cancelar</button>}</div></form></div></div></div>
    <div className="col-lg-8"><div className="card border-0 shadow-sm"><div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th aria-label="Acciones" /></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><span className="me-2">{product.emoji}</span>{product.name}</td><td>{product.category}</td><td>{formatMoney(product.price)}</td><td>{product.stock}</td><td className="text-nowrap"><button className="btn btn-sm btn-outline-success me-1" onClick={() => edit(product)}>Editar</button><button className="btn btn-sm btn-outline-danger" onClick={() => remove(product.id)}>Eliminar</button></td></tr>)}</tbody></table></div></div>
      <div className="card border-0 shadow-sm mt-4"><div className="card-body"><h2 className="h5">Pedidos</h2>{orders.length ? orders.map((order) => <div className="border-top pt-2 mt-2 small d-flex justify-content-between align-items-center gap-2 flex-wrap" key={order.id}><span>#{order.id} · {order.customer.name} · {new Date(order.createdAt).toLocaleDateString('es-CL')}</span><strong>{formatMoney(order.total)}</strong><select className="form-select form-select-sm w-auto" value={order.status} disabled={order.status === 'CANCELADO'} onChange={(e) => changeStatus(order.id, e.target.value)}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>) : <p className="text-secondary mb-0">Aún no hay pedidos registrados.</p>}</div></div>
      <div className="card border-0 shadow-sm mt-4"><div className="card-body"><h2 className="h5">Usuarios y roles</h2>{users.map((u) => <div className="border-top pt-2 mt-2 small d-flex justify-content-between align-items-center gap-2" key={u.id}><span>{u.name} · <span className="text-secondary">{u.email}</span></span><select className="form-select form-select-sm w-auto" value={u.role} disabled={u.id === user.id} onChange={(e) => changeRole(u.id, e.target.value)}><option value="CLIENTE">CLIENTE</option><option value="ADMIN">ADMIN</option></select></div>)}</div></div>
    </div></div></section>;
}
