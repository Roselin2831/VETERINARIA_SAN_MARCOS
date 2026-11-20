import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { formatMoney, toneFor } from '../components/ProductCard';
import Icon from '../components/Icon';
import ProductImage from '../components/ProductImage';

// Los valores (value) son los que el backend guarda; no cambiarlos sin actualizar la API.
const DELIVERY = [
  { value: 'Despacho a domicilio', icon: 'truck', hint: 'Te lo llevamos a casa' },
  { value: 'Retiro en veterinaria', icon: 'home', hint: 'Retira en San Marcos' }
];
const PAYMENT = [
  { value: 'Tarjeta de débito', icon: 'card', hint: 'Redcompra' },
  { value: 'Tarjeta de crédito', icon: 'card', hint: 'Visa, Mastercard' },
  { value: 'Transferencia', icon: 'bank', hint: 'Desde tu banco' }
];

function Options({ name, options, value, onChange }) {
  return <div className="options" role="radiogroup">
    {options.map((opt) => <label className="option" key={opt.value}>
      <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} />
      <span className="opt-icon"><Icon name={opt.icon} size={20} /></span>
      <span>{opt.value}<small>{opt.hint}</small></span>
      <span className="tick"><Icon name="check" size={13} /></span>
    </label>)}
  </div>;
}

export default function Checkout() {
  const { cart, cartTotal, cartCount, setCart, refreshProducts } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', address: '', delivery: DELIVERY[0].value, payment: PAYMENT[0].value });

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    if (!cart.length) return navigate('/carrito');
    setError(''); setSending(true);
    try {
      const order = await createOrder(form, cart);
      setCart([]);
      await refreshProducts();
      navigate('/resultado/exito', { state: { order } });
    } catch (err) {
      setError(err.message);
      if (err.status === 409) refreshProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setSending(false); }
  };

  if (!cart.length && !sending) return <section className="container">
    <div className="empty">
      <div className="empty-art" aria-hidden="true">🧺</div>
      <h1>No hay nada que pagar</h1>
      <p>Tu carrito está vacío. Agrega productos para continuar con la compra.</p>
      <Link className="btn btn-warm btn-lg" to="/categorias">Ir a la tienda<Icon name="arrow" size={18} /></Link>
    </div>
  </section>;

  const pickup = form.delivery === 'Retiro en veterinaria';

  return <section className="container pb-4">
    <header className="page-head">
      <p className="kicker"><Icon name="lock" size={14} />Pago seguro</p>
      <h1>Finalizar compra</h1>
      <p>Completa tus datos. El total final lo calcula el servidor con los precios vigentes.</p>
      <ol className="steps" aria-label="Progreso de la compra">
        <li className="step done"><span className="step-num"><Icon name="check" size={14} /></span>Carrito</li>
        <li className="step-sep" aria-hidden="true" />
        <li className="step current" aria-current="step"><span className="step-num">2</span>Datos y pago</li>
        <li className="step-sep" aria-hidden="true" />
        <li className="step"><span className="step-num">3</span>Confirmación</li>
      </ol>
    </header>

    {error && <div className="alert alert-danger" role="alert"><Icon name="alert" />{error}</div>}

    <div className="row g-4">
      <form id="checkout-form" className="col-lg-8" onSubmit={submit}>
        <div className="panel">
          <h2 className="panel-title"><span className="n">1</span>Tus datos</h2>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label" htmlFor="co-name">Nombre completo</label><input id="co-name" required name="name" autoComplete="name" className="form-control" value={form.name} onChange={change} /></div>
            <div className="col-md-6"><label className="form-label" htmlFor="co-email">Correo</label><input id="co-email" required type="email" name="email" autoComplete="email" className="form-control" value={form.email} onChange={change} /></div>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title"><span className="n">2</span>Entrega</h2>
          <Options name="delivery" options={DELIVERY} value={form.delivery} onChange={change} />
          <div className="mt-3">
            <label className="form-label" htmlFor="co-address">{pickup ? 'Dirección (para tu boleta)' : 'Dirección de despacho'}</label>
            <input id="co-address" required name="address" autoComplete="street-address" className="form-control" placeholder="Calle, número, comuna" value={form.address} onChange={change} />
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title"><span className="n">3</span>Medio de pago</h2>
          <Options name="payment" options={PAYMENT} value={form.payment} onChange={change} />
        </div>
      </form>

      <aside className="col-lg-4">
        <div className="summary">
          <h2>Tu pedido</h2>
          {cart.map((item) => <div className={`summary-item ${toneFor(item.category)}`} key={item.id}>
            <ProductImage product={item} className="thumb sm" />
            <span className="name">{item.name}<small>{item.quantity} × {formatMoney(item.price)}</small></span>
            <strong>{formatMoney(item.quantity * item.price)}</strong>
          </div>)}
          <div className="summary-row mt-2"><span>Entrega</span><span>{pickup ? 'Retiro' : 'Despacho'}</span></div>
          <div className="summary-total"><span>Total</span><span>{formatMoney(cartTotal)}</span></div>
          <button className="btn btn-warm btn-lg w-100 mt-4" type="submit" form="checkout-form" disabled={sending || !cart.length}>
            {sending ? 'Confirmando…' : <>Confirmar compra<Icon name="check" size={18} /></>}
          </button>
          <p className="summary-note"><Icon name="shield" size={16} />{cartCount} {cartCount === 1 ? 'producto' : 'productos'} · Puedes seguir tu pedido en «Mis pedidos».</p>
        </div>
      </aside>
    </div>
  </section>;
}
