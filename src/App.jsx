import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Result from './pages/Result';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

export default function App() {
  return <ShopProvider><BrowserRouter><Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/categorias" element={<Catalog />} />
      <Route path="/ofertas" element={<Catalog offersOnly />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/resultado/:status" element={<Result />} />
      <Route path="/admin" element={<Admin />} />
    </Route>
    <Route path="/ingresar" element={<Auth mode="login" />} />
    <Route path="/registro" element={<Auth mode="register" />} />
  </Routes></BrowserRouter></ShopProvider>;
}
