import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';
import { PHOTOS } from '../data/photos';

const features = [
  { icon: 'stethoscope', tone: 'tone-sage', title: 'Cuidado profesional', text: 'Productos escogidos por nuestro equipo para el bienestar de tu mascota.' },
  { icon: 'truck', tone: 'tone-mustard', title: 'Compra simple', text: 'Elige, revisa tu carrito y recibe en casa o retira en la veterinaria.' },
  { icon: 'shield', tone: 'tone-blush', title: 'Compra segura', text: 'Tu cuenta y tus pedidos protegidos; revisa el estado de cada compra.' }
];

export default function Home() {
  const { products, loadingProducts } = useShop();
  const { user } = useAuth();
  const featured = [...products].sort((a, b) => Number(b.offer) - Number(a.offer)).slice(0, 3);

  return <>
    <section className="hero">
      <Icon name="paw" size={120} className="paw-deco" style={{ top: '8%', left: '-30px', transform: 'rotate(-20deg)' }} />
      <Icon name="paw" size={70} className="paw-deco" style={{ bottom: '6%', left: '42%', transform: 'rotate(18deg)' }} />
      <div className="container">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6">
            <span className="eyebrow rise"><Icon name="paw" size={16} />Desde 2009 · Rancagua</span>
            <h1 className="hero-title rise rise-2">La salud de tu mascota, <span className="squiggle">siempre cerca</span>.</h1>
            <p className="hero-lead rise rise-3">Productos, prevención y atención veterinaria en un solo lugar. Cuidamos perros, gatos, conejos y aves como si fueran nuestros.</p>
            <div className="hero-actions rise rise-4">
              <Link className="btn btn-warm btn-lg" to="/categorias">Ver productos<Icon name="arrow" size={18} /></Link>
              {user
                ? <Link className="btn btn-line btn-lg" to="/mis-pedidos">Mis pedidos</Link>
                : <Link className="btn btn-line btn-lg" to="/registro">Crear mi cuenta</Link>}
            </div>
            <div className="hero-species rise rise-4" aria-label="Especies que atendemos">
              <span className="species-tag"><span className="tone-sage tone-dot">🐶</span>Perros</span>
              <span className="species-tag"><span className="tone-mustard tone-dot">🐱</span>Gatos</span>
              <span className="species-tag"><span className="tone-blush tone-dot">🐰</span>Conejos</span>
              <span className="species-tag"><span className="tone-sand tone-dot">🦜</span>Aves</span>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-art" aria-hidden="true">
              <div className="blob blob-b" />
              <div className="hero-photo"><img src={PHOTOS.portada} alt="" fetchpriority="high" /></div>
              <span className="float-chip c1"><span className="tone-mustard tone-dot">🦴</span>Snacks sanos</span>
              <span className="float-chip c2"><span className="tone-blush tone-dot">💊</span>Prevención</span>
              <span className="float-chip c3"><span className="tone-sage tone-dot">🧴</span>Higiene</span>
              <div className="hero-note"><b>Atención cercana</b>para toda la familia</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="container py-5">
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <p className="kicker"><Icon name="sparkle" size={14} />Destacados</p>
          <h2 className="section-title">Todo para una vida más saludable</h2>
        </div>
        <Link to="/categorias" className="link-arrow">Ver toda la tienda<Icon name="arrow" size={18} /></Link>
      </div>
      <div className="row g-4">
        {loadingProducts && !products.length
          ? [1, 2, 3].map((n) => <div className="col-md-6 col-lg-4" key={n}><div className="skeleton" /></div>)
          : featured.map((product) => <div className="col-md-6 col-lg-4" key={product.id}><ProductCard product={product} /></div>)}
      </div>
    </section>

    <section className="container py-5">
      <div className="row g-4 g-lg-5 align-items-center">
        <div className="col-lg-5">
          <figure className="care-photo">
            <img src={PHOTOS.atencion} alt="Veterinario examinando a un perro dachshund" loading="lazy" />
            <figcaption className="care-badge"><span className="feature-icon tone-sage"><Icon name="stethoscope" size={22} /></span><span><b>Atención veterinaria</b>Perros, gatos, conejos y aves</span></figcaption>
          </figure>
        </div>
        <div className="col-lg-7">
          <p className="kicker">¿Por qué San Marcos?</p>
          <h2 className="section-title mb-3">Pensado para ti y tu mascota</h2>
          <p className="text-secondary fs-5 mb-4">Somos una veterinaria de barrio en Rancagua: conocemos a nuestros pacientes por su nombre y elegimos cada producto pensando en ellos.</p>
          <div className="feature-list">
            {features.map((f) => <div className={`feature-row ${f.tone}`} key={f.title}>
              <div className="feature-icon"><Icon name={f.icon} size={24} /></div>
              <div><h3>{f.title}</h3><p>{f.text}</p></div>
            </div>)}
          </div>
        </div>
      </div>
    </section>

    <section className="container pt-4">
      <div className="cta-band d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
        <Icon name="paw" size={220} className="paw-deco" style={{ right: '-40px', top: '-50px', transform: 'rotate(25deg)' }} />
        <div className="cta-photo" aria-hidden="true"><img src={PHOTOS.familia} alt="" loading="lazy" /></div>
        <div className="flex-grow-1">
          <h2>{user ? `¡Hola de nuevo, ${user.name.split(' ')[0]}!` : 'Crea tu cuenta y compra en minutos'}</h2>
          <p>{user ? 'Revisa las ofertas vigentes y sigue el estado de tus pedidos desde tu cuenta.' : 'Guarda tus datos, revisa tus pedidos y recibe todo lo que tu mascota necesita.'}</p>
        </div>
        <Link className="btn btn-cream btn-lg" to={user ? '/ofertas' : '/registro'}>{user ? 'Ver ofertas' : 'Crear mi cuenta'}<Icon name="arrow" size={18} /></Link>
      </div>
    </section>
  </>;
}
