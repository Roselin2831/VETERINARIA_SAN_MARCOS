import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { Layout } from './components/Layout';
import ProtectedRoute, { StorefrontRoute } from './components/ProtectedRoute';
import Seller from './pages/Seller';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Result from './pages/Result';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import MyOrders from './pages/MyOrders';
import Forbidden from './pages/Forbidden';

export default function App() {
  return <AuthProvider><ShopProvider><BrowserRouter><Routes>
    <Route element={<Layout />}>
      <Route element={<StorefrontRoute />}>
      {/* Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/categorias" element={<Catalog />} />
      <Route path="/ofertas" element={<Catalog offersOnly />} />
      <Route path="/carrito" element={<Cart />} />
      </Route>
      <Route path="/no-autorizado" element={<Forbidden />} />
      <Route path="*" element={<section className="container py-5"><h1>Página no encontrada</h1><a href="/">Volver al inicio</a></section>} />

      {/* Cualquier usuario con sesión (CLIENTE o ADMIN) */}
      <Route element={<ProtectedRoute roles={['CLIENTE', 'ADMIN']} />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/resultado/:status" element={<Result />} />
        <Route path="/mis-pedidos" element={<MyOrders />} />
      </Route>

      <Route element={<ProtectedRoute roles={['VENDEDOR', 'ADMIN']} />}>
        <Route path="/vendedor" element={<Seller />} />
      </Route>

      {/* Solo ADMIN */}
      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Route>
    <Route path="/ingresar" element={<Auth mode="login" />} />
    <Route path="/registro" element={<Auth mode="register" />} />
  </Routes></BrowserRouter></ShopProvider></AuthProvider>;
}
