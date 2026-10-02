import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readProducts } from '../data/mockDb';
const ShopContext = createContext(null);
const CART_KEY = 'san-marcos-cart-v2';
export function ShopProvider({ children }) {
  const [products, setProducts] = useState(readProducts);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem(CART_KEY) || '[]'));
  const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem('san-marcos-user') || 'null'));
  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);
  const refreshProducts = () => setProducts(readProducts());
  const addToCart = (product) => setCart((current) => { const found = current.find((item) => item.id === product.id); return found ? current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item) : [...current, { ...product, quantity: 1 }]; });
  const updateQuantity = (id, quantity) => setCart((current) => quantity < 1 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, quantity } : item));
  const logout = () => { sessionStorage.removeItem('san-marcos-user'); setUser(null); };
  const login = (nextUser) => { sessionStorage.setItem('san-marcos-user', JSON.stringify(nextUser)); setUser(nextUser); };
  const value = useMemo(() => ({ products, cart, user, refreshProducts, addToCart, updateQuantity, setCart, login, logout, cartCount: cart.reduce((total, item) => total + item.quantity, 0), cartTotal: cart.reduce((total, item) => total + item.price * item.quantity, 0) }), [products, cart, user]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
export const useShop = () => useContext(ShopContext);
