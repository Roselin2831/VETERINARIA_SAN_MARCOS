import { useMemo, useState } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
export default function Catalog({ offersOnly = false }) {
  const { products } = useShop(); const [category, setCategory] = useState('Todas'); const [query, setQuery] = useState('');
  const categories = ['Todas', ...new Set(products.map((product) => product.category))];
  const visible = useMemo(() => products.filter((product) => (!offersOnly || product.offer) && (category === 'Todas' || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase())), [products, offersOnly, category, query]);
  return <section className="container py-5"><p className="text-success fw-bold text-uppercase small">Tienda San Marcos</p><h1 className="serif">{offersOnly ? 'Ofertas para cuidar más' : 'Productos por categoría'}</h1><p className="text-secondary">Filtra y encuentra lo que tu mascota necesita.</p><div className="row g-3 my-3"><div className="col-md-7"><input className="form-control" aria-label="Buscar productos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto" /></div><div className="col-md-5"><select className="form-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar categoría">{categories.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="row g-4 mt-1">{visible.map((product) => <div className="col-sm-6 col-lg-4" key={product.id}><ProductCard product={product} /></div>)}{!visible.length && <p className="text-secondary">No encontramos productos con esos filtros.</p>}</div></section>;
}
