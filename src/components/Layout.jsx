import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const pill = ({ isActive }) => `nav-pill${isActive ? ' active' : ''}`;

export function Brand({ to = '/' }) {
  return <Link className="brand" to={to} aria-label="Veterinaria San Marcos, inicio">
    <span className="brand-mark"><Icon name="paw" size={24} /></span>
    <span className="brand-name">San Marcos<small>Veterinaria</small></span>
  </Link>;
}

export function Layout() {
  const { cartCount } = useShop();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const lastCount = useRef(cartCount);

  // Cierra el menú móvil al cambiar de página y vuelve arriba
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [location.pathname]);

  // Pequeña animación del contador cuando se agrega algo al carrito
  useEffect(() => {
    if (cartCount > lastCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      lastCount.current = cartCount;
      return () => clearTimeout(t);
    }
    lastCount.current = cartCount;
  }, [cartCount]);

  const leave = async () => { try { await logout(); } catch { /* La sesión local se cierra también sin conexión. */ } navigate('/'); };
  const firstName = user?.name?.split(' ')[0] || '';

  if (user?.role === 'VENDEDOR') return <div className="app-shell">
    <header className="site-header"><nav className="container nav-wrap" aria-label="Principal">
      <Brand to="/vendedor" />
      <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="seller-menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={22} /></button>
      <div id="seller-menu" className={`nav-menu${open ? ' open' : ''}`}>
        <NavLink className={pill} to="/vendedor">Consulta de productos y pedidos</NavLink>
        <span>{user.name} · VENDEDOR</span><button className="btn btn-ghost" onClick={leave}>Salir</button>
      </div>
    </nav></header>
    <main id="contenido"><Outlet /></main>
    <footer className="container py-4">Veterinaria San Marcos</footer>
  </div>;

  return <div className="app-shell">
    <a className="visually-hidden-focusable btn btn-warm m-2 position-absolute" href="#contenido">Saltar al contenido</a>
    <header className="site-header">
      <nav className="container nav-wrap" aria-label="Principal">
        <Brand />
        <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(!open)}>
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
        <div id="menu" className={`nav-menu${open ? ' open' : ''}`}>
          <NavLink className={pill} to="/categorias">Tienda</NavLink>
          <NavLink className={pill} to="/ofertas"><Icon name="tag" size={16} />Ofertas</NavLink>
          {user && <NavLink className={pill} to="/mis-pedidos">Mis pedidos</NavLink>}
          {isAdmin && <NavLink className={pill} to="/admin">Administración</NavLink>}
          <span className="nav-divider" aria-hidden="true" />
          <NavLink className={({ isActive }) => `cart-chip${isActive ? ' active' : ''}`} to="/carrito" aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}>
            <Icon name="bag" size={18} />Carrito
            <span className={`cart-count${cartCount ? '' : ' is-zero'}${bump ? ' bump' : ''}`}>{cartCount}</span>
          </NavLink>
          {user
            ? <>
              <span className="user-chip" title={user.email}>
                <span className={`avatar${isAdmin ? ' admin' : ''}`} aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>
                <span className="who">Hola, {firstName}<small>{user.role}</small></span>
              </span>
              <button className="btn btn-ghost btn-sm" type="button" onClick={leave}><Icon name="logout" size={16} />Salir</button>
            </>
            : <NavLink className="btn btn-warm" to="/ingresar"><Icon name="user" size={18} />Ingresar</NavLink>}
        </div>
      </nav>
    </header>

    <main id="contenido"><Outlet /></main>

    <footer className="site-footer">
      <svg className="wave" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 0h1440v14c-120 22-240 34-360 22S840 0 720 8 480 44 360 40 120 14 0 22z" /></svg>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5">
            <Brand />
            <p className="mt-3 mb-0" style={{ maxWidth: '36ch' }}>Cuidamos a quienes son parte de tu familia. Productos y atención veterinaria para perros, gatos, conejos y aves.</p>
          </div>
          <div className="col-6 col-lg-3">
            <h2>Tienda</h2>
            <ul>
              <li><Link to="/categorias">Todos los productos</Link></li>
              <li><Link to="/ofertas">Ofertas</Link></li>
              <li><Link to="/carrito">Carrito</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-4">
            <h2>Tu cuenta</h2>
            <ul>
              {user
                ? <><li><Link to="/mis-pedidos">Mis pedidos</Link></li>{isAdmin && <li><Link to="/admin">Administración</Link></li>}</>
                : <><li><Link to="/ingresar">Ingresar</Link></li><li><Link to="/registro">Crear cuenta</Link></li></>}
              <li className="d-flex align-items-center gap-2"><Icon name="pin" size={16} />Rancagua, Chile</li>
            </ul>
          </div>
        </div>
        <div className="fine">
          <span>© {new Date().getFullYear()} Veterinaria San Marcos</span>
          <span>Hecho con <Icon name="heart" size={14} /> en Rancagua</span>
        </div>
      </div>
    </footer>
  </div>;
}
