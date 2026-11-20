import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { formatMoney, toneFor } from '../components/ProductCard';
import Icon from '../components/Icon';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { cart, cartTotal, cartCount, updateQuantity } = useShop();

  if (!cart.length) return <section className="container">
    <div className="empty">
      <div className="empty-art" aria-hidden="true">🧺</div>
      <h1>Tu carrito está vacío</h1>
      <p>Aún no has agregado productos. Date una vuelta por la tienda, seguro hay algo que le encantará a tu mascota.</p>
      <Link className="btn btn-warm btn-lg" to="/categorias">Ir a la tienda<Icon name="arrow" size={18} /></Link>
    </div>
  </section>;

  return <section className="container pb-4">
    <header className="page-head">
      <p className="kicker"><Icon name="bag" size={14} />Carrito</p>
      <h1>Tu carrito</h1>
      <p>{cartCount} {cartCount === 1 ? 'producto' : 'productos'} listos para tu mascota.</p>
    </header>
    <div className="row g-4">
      <div className="col-lg-8">
        {cart.map((item) => <div className={`cart-item ${toneFor(item.category)}`} key={item.id}>
          <ProductImage product={item} className="thumb" />
          <div>
            <h2>{item.name}</h2>
            <span className="unit">{formatMoney(item.price)} c/u</span>
          </div>
          <div className="stepper">
            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={item.quantity === 1 ? `Eliminar ${item.name}` : `Quitar ${item.name}`}>
              <Icon name={item.quantity === 1 ? 'trash' : 'minus'} size={16} />
            </button>
            <output aria-live="polite">{item.quantity}</output>
            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label={`Agregar ${item.name}`}>
              <Icon name="plus" size={16} />
            </button>
          </div>
          <span className="line-total">{formatMoney(item.price * item.quantity)}</span>
        </div>)}
        <Link className="link-arrow mt-2" to="/categorias"><Icon name="back" size={18} />Seguir comprando</Link>
      </div>
      <aside className="col-lg-4">
        <div className="summary">
          <h2>Resumen de compra</h2>
          <div className="summary-row"><span>Productos ({cartCount})</span><span>{formatMoney(cartTotal)}</span></div>
          <div className="summary-row"><span>Entrega</span><span>Se elige al pagar</span></div>
          <div className="summary-total"><span>Total</span><span>{formatMoney(cartTotal)}</span></div>
          <Link className="btn btn-warm btn-lg w-100 mt-4" to="/checkout">Continuar al pago<Icon name="arrow" size={18} /></Link>
          <p className="summary-note"><Icon name="lock" size={16} />El total final lo confirma el servidor con los precios y el stock vigentes.</p>
        </div>
      </aside>
    </div>
  </section>;
}
