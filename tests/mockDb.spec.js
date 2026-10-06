//llamado de datos de prueba
import { seedProducts, createProduct, deleteProduct, readProducts, resetDatabase, updateProduct } from '../src/data/mockDb.js'; 
const storage = new Map();
global.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
describe('base de datos simulada', () => {
  beforeEach(() => { storage.clear(); resetDatabase(); });
  it('entrega los productos iniciales', () => expect(readProducts().length).toBe(seedProducts.length));
  it('crea y recupera un producto', () => { const product = createProduct({ name: 'Collar', category: 'Higiene', price: '5000', stock: '3', offer: false, description: 'Ajustable', emoji: '🐾' }); expect(readProducts().some((item) => item.id === product.id)).toBeTrue(); expect(product.price).toBe(5000); });
  it('actualiza y elimina un producto', () => { const product = createProduct({ name: 'Test', category: 'Salud', price: 1, stock: 1, offer: false, description: 'Prueba', emoji: '🩺' }); updateProduct(product.id, { ...product, name: 'Actualizado', price: 2 }); expect(readProducts().find((item) => item.id === product.id).name).toBe('Actualizado'); deleteProduct(product.id); expect(readProducts().some((item) => item.id === product.id)).toBeFalse(); });
});

