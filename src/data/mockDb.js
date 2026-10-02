const STORAGE_KEY = 'san-marcos-store-v2';

export const seedProducts = [
  { id: 'p1', name: 'Alimento perro adulto', category: 'Alimentos', price: 18990, stock: 16, offer: true, description: 'Nutrición completa para perros adultos.', emoji: '🐕' },
  { id: 'p2', name: 'Arena sanitaria premium', category: 'Higiene', price: 7990, stock: 22, offer: false, description: 'Control de olores y alta absorción.', emoji: '🐈' },
  { id: 'p3', name: 'Antiparasitario externo', category: 'Salud', price: 12490, stock: 9, offer: true, description: 'Protección mensual contra pulgas y garrapatas.', emoji: '🩺' },
  { id: 'p4', name: 'Snack dental', category: 'Alimentos', price: 4290, stock: 30, offer: false, description: 'Premio saludable para su cuidado oral.', emoji: '🦴' },
  { id: 'p5', name: 'Shampoo hipoalergénico', category: 'Higiene', price: 8990, stock: 12, offer: false, description: 'Limpieza suave para pieles sensibles.', emoji: '🫧' },
  { id: 'p6', name: 'Vitaminas multiespecie', category: 'Salud', price: 10990, stock: 14, offer: true, description: 'Apoyo diario para perros y gatos.', emoji: '💊' }
];

const initialState = () => ({ products: seedProducts, users: [{ id: 'u1', name: 'Administración San Marcos', email: 'admin@sanmarcos.cl', password: 'Admin123!', role: 'admin' }], orders: [] });
const load = () => { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); return saved?.products ? saved : initialState(); } catch { return initialState(); } };
const save = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const readProducts = () => load().products;
export const readOrders = () => load().orders;
export const createProduct = (product) => { const state = load(); const record = { ...product, id: makeId('p'), price: Number(product.price), stock: Number(product.stock), offer: Boolean(product.offer) }; state.products.push(record); save(state); return record; };
export const updateProduct = (id, changes) => { const state = load(); const index = state.products.findIndex((product) => product.id === id); if (index < 0) throw new Error('Producto no encontrado.'); state.products[index] = { ...state.products[index], ...changes, price: Number(changes.price ?? state.products[index].price), stock: Number(changes.stock ?? state.products[index].stock) }; save(state); return state.products[index]; };
export const deleteProduct = (id) => { const state = load(); state.products = state.products.filter((product) => product.id !== id); save(state); };
export const registerUser = ({ name, email, password }) => { const state = load(); if (state.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) throw new Error('Este correo ya está registrado.'); const user = { id: makeId('u'), name, email, password, role: 'customer' }; state.users.push(user); save(state); return { ...user, password: undefined }; };
export const authenticate = (email, password) => { const user = load().users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password); if (!user) throw new Error('Correo o contraseña incorrectos.'); return { ...user, password: undefined }; };
export const createOrder = ({ customer, items, total }) => { if (!items.length) throw new Error('El carrito está vacío.'); const state = load(); const order = { id: makeId('o'), customer, items, total, createdAt: new Date().toISOString(), status: 'Confirmada' }; state.orders.unshift(order); save(state); return order; };
export const resetDatabase = () => localStorage.removeItem(STORAGE_KEY);
