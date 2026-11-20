import { useMemo, useState } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard, { toneFor } from '../components/ProductCard';
import Icon from '../components/Icon';

export default function Catalog({ offersOnly = false }) {
  const { products, loadingProducts, productsError } = useShop();
  const [category, setCategory] = useState('Todas');
  const [query, setQuery] = useState('');

  const categories = ['Todas', ...new Set(products.map((product) => product.category))];
  const visible = useMemo(() => products.filter((product) =>
    (!offersOnly || product.offer)
    && (category === 'Todas' || product.category === category)
    && product.name.toLowerCase().includes(query.trim().toLowerCase())
  ), [products, offersOnly, category, query]);
  const clear = () => { setQuery(''); setCategory('Todas'); };

  return <section className="container pb-4">
    <header className="page-head">
      <p className="kicker">{offersOnly ? <><Icon name="tag" size={14} />Ofertas</> : <><Icon name="paw" size={14} />Tienda San Marcos</>}</p>
      <h1>{offersOnly ? 'Ofertas para cuidar más' : 'Todo para tu mascota'}</h1>
      <p>{offersOnly ? 'Productos con precio especial mientras dure el stock.' : 'Busca por nombre o filtra por categoría y encuentra lo que tu mascota necesita.'}</p>
    </header>

    <div className="toolbar">
      <label className="search mb-0">
        <span className="visually-hidden">Buscar productos</span>
        <Icon name="search" size={18} />
        <input className="form-control" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto…" />
      </label>
      <div className="chips" role="group" aria-label="Filtrar por categoría">
        {categories.map((item) => <button key={item} type="button" className={`chip ${item === 'Todas' ? '' : toneFor(item)}`} aria-pressed={category === item} onClick={() => setCategory(item)}>
          {item !== 'Todas' && <span className="tone-dot" aria-hidden="true" />}{item}
        </button>)}
      </div>
    </div>

    {productsError && <div className="alert alert-danger" role="alert"><Icon name="alert" />{productsError}</div>}

    {!loadingProducts && !productsError && visible.length > 0 && <p className="result-count" aria-live="polite">{visible.length} {visible.length === 1 ? 'producto' : 'productos'}</p>}

    <div className="row g-4">
      {loadingProducts && !products.length && [1, 2, 3, 4, 5, 6].map((n) => <div className="col-sm-6 col-lg-4" key={n}><div className="skeleton" /></div>)}
      {visible.map((product) => <div className="col-sm-6 col-lg-4" key={product.id}><ProductCard product={product} /></div>)}
    </div>

    {!loadingProducts && !productsError && !visible.length && <div className="empty">
      <div className="empty-art" aria-hidden="true">🔍</div>
      <h2>No encontramos productos</h2>
      <p>{offersOnly && !query && category === 'Todas' ? 'Por ahora no hay ofertas activas. ¡Vuelve pronto!' : 'Prueba con otra búsqueda o cambia la categoría.'}</p>
      {(query || category !== 'Todas') && <button className="btn btn-soft" type="button" onClick={clear}>Limpiar filtros</button>}
    </div>}
  </section>;
}
