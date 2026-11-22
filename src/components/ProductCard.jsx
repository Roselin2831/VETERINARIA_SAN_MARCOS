import { useShop } from '../context/ShopContext';
const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
export const formatMoney = (value) => money.format(value);
export default function ProductCard({ product }) {
  const { addToCart } = useShop();
  return <article className="card h-100 product-card border-0 shadow-sm"><div className="card-body d-flex flex-column"><div className="d-flex justify-content-between align-items-start"><span className="product-emoji">{product.emoji || '🐾'}</span>{product.offer && <span className="badge text-bg-warning">Oferta</span>}</div><p className="text-success fw-semibold small mb-1">{product.category}</p><h2 className="h5">{product.name}</h2><p className="text-secondary small flex-grow-1">{product.description}</p><div className="d-flex align-items-center justify-content-between gap-2"><strong>{formatMoney(product.price)}</strong><button className="btn btn-success btn-sm" disabled={!product.stock} onClick={() => addToCart(product)}>{product.stock ? 'Agregar' : 'Sin stock'}</button></div></div></article>;
}
