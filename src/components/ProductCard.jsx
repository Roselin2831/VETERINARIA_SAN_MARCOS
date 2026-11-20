import { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import Icon from './Icon';
import ProductImage from './ProductImage';

const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
export const formatMoney = (value) => money.format(value);

// Cada categoría tiene su color; las nuevas reciben uno estable según su nombre.
const TONES = { Alimentos: 'sage', Higiene: 'mustard', Salud: 'blush' };
const FALLBACK = ['sage', 'mustard', 'blush'];
export const toneFor = (category = '') => {
  if (TONES[category]) return `tone-${TONES[category]}`;
  const hash = [...category].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return `tone-${FALLBACK[hash % FALLBACK.length]}`;
};

export default function ProductCard({ product }) {
  const { addToCart } = useShop();
  const [added, setAdded] = useState(false);
  const lowStock = product.stock > 0 && product.stock <= 5;

  useEffect(() => {
    if (!added) return undefined;
    const t = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(t);
  }, [added]);

  const add = () => { addToCart(product); setAdded(true); };

  return <article className={`pcard ${toneFor(product.category)}`}>
    <div className="pcard-media">
      <ProductImage product={product} className="pcard-art" />
      {product.offer && <span className="pcard-badge">Oferta</span>}
      {lowStock && <span className="pcard-stock">¡Quedan {product.stock}!</span>}
    </div>
    <div className="pcard-body">
      <p className="pcard-cat">{product.category}</p>
      <h2 className="pcard-title">{product.name}</h2>
      <p className="pcard-desc">{product.description}</p>
      <div className="pcard-foot">
        <span className="price">{formatMoney(product.price)}</span>
        <button className={`btn btn-warm btn-sm btn-add${added ? ' added' : ''}`} type="button" disabled={!product.stock} onClick={add}>
          {product.stock ? <><Icon name={added ? 'check' : 'plus'} size={16} />{added ? 'Agregado' : 'Agregar'}</> : 'Sin stock'}
        </button>
      </div>
    </div>
  </article>;
}
