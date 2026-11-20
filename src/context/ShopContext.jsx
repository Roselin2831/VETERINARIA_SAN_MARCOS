import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProducts } from '../services/productService';

const ShopContext = createContext(null);
const CART_KEY = 'san-marcos-cart-v3';

/** Catálogo (desde la API) y carrito (en localStorage, no requiere sesión). */
export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  });

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);

  const refreshProducts = useCallback(async () => {
    setProductsError('');
    try {
      const list = await getProducts();
      setProducts(list);
      // Sincroniza el carrito con precios/stock actuales y quita productos eliminados
      setCart((current) => current
        .map((item) => {
          const fresh = list.find((p) => p.id === item.id);
          return fresh ? { ...fresh, quantity: Math.min(item.quantity, fresh.stock) } : null;
        })
        .filter((item) => item && item.quantity > 0));
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => { refreshProducts(); }, [refreshProducts]);

  const addToCart = (product) => setCart((current) => {
    const found = current.find((item) => item.id === product.id);
    return found
      ? current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
      : [...current, { ...product, quantity: 1 }];
  });

  const updateQuantity = (id, quantity) => setCart((current) => quantity < 1
    ? current.filter((item) => item.id !== id)
    : current.map((item) => item.id === id ? { ...item, quantity } : item));

  const value = useMemo(() => ({
    products, loadingProducts, productsError, refreshProducts, cart, setCart, addToCart, updateQuantity,
    cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    cartTotal: cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }), [products, loadingProducts, productsError, refreshProducts, cart]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
