import { createServer } from 'node:http';
import { signToken, verifyPassword, hashPassword, verifyToken } from './auth.js';
import { makeId } from './db.js';

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const CATEGORIES = ['Alimentos', 'Higiene', 'Salud'];
const publicUser = ({ passwordHash, ...user }) => user;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanProduct(input, current = {}) {
  const merged = { ...current, ...input };
  const price = Number(merged.price);
  const stock = Number(merged.stock);
  if (!String(merged.name || '').trim()) throw new HttpError(400, 'El nombre es obligatorio.');
  if (!CATEGORIES.includes(merged.category)) throw new HttpError(400, `Categoría inválida. Use: ${CATEGORIES.join(', ')}.`);
  if (!Number.isFinite(price) || price < 0) throw new HttpError(400, 'El precio debe ser un número mayor o igual a 0.');
  if (!Number.isInteger(stock) || stock < 0) throw new HttpError(400, 'El stock debe ser un entero mayor o igual a 0.');
  return {
    id: current.id,
    name: String(merged.name).trim(),
    category: merged.category,
    price,
    stock,
    offer: Boolean(merged.offer),
    description: String(merged.description || '').trim(),
    emoji: String(merged.emoji || '🐾').slice(0, 8)
  };
}

export function createApp(db, { corsOrigin = process.env.CORS_ORIGIN || '*' } = {}) {
  // Rutas: [método, patrón, handler]
  const routes = [];
  const route = (method, path, handler) => {
    const keys = [];
    const regex = new RegExp(`^${path.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; })}$`);
    routes.push({ method, regex, keys, handler });
  };

  const requireAuth = (ctx) => {
    if (!ctx.auth) throw new HttpError(401, 'Debes iniciar sesión.');
    return ctx.auth;
  };
  const requireAdmin = (ctx) => {
    if (requireAuth(ctx).role !== 'admin') throw new HttpError(403, 'Solo administradores.');
  };

  // ---------- Salud ----------
  route('GET', '/api/health', () => ({ status: 200, body: { ok: true, service: 'veterinaria-san-marcos' } }));

  // ---------- Auth ----------
  route('POST', '/api/auth/register', ({ body }) => {
    const { name, email, password } = body;
    if (!String(name || '').trim()) throw new HttpError(400, 'El nombre es obligatorio.');
    if (!EMAIL_RE.test(String(email || ''))) throw new HttpError(400, 'Correo inválido.');
    if (String(password || '').length < 6) throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres.');
    if (db.state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new HttpError(409, 'Este correo ya está registrado.');
    const user = { id: makeId('u'), name: name.trim(), email: email.trim(), passwordHash: hashPassword(password), role: 'customer' };
    db.state.users.push(user);
    db.save();
    return { status: 201, body: { user: publicUser(user), token: signToken(user) } };
  });

  route('POST', '/api/auth/login', ({ body }) => {
    const user = db.state.users.find((u) => u.email.toLowerCase() === String(body.email || '').toLowerCase());
    if (!user || !verifyPassword(String(body.password || ''), user.passwordHash)) throw new HttpError(401, 'Correo o contraseña incorrectos.');
    return { status: 200, body: { user: publicUser(user), token: signToken(user) } };
  });

  route('GET', '/api/auth/me', (ctx) => {
    const { sub } = requireAuth(ctx);
    const user = db.state.users.find((u) => u.id === sub);
    if (!user) throw new HttpError(401, 'Usuario no encontrado.');
    return { status: 200, body: { user: publicUser(user) } };
  });

  // ---------- Productos ----------
  route('GET', '/api/products', ({ query }) => {
    let list = db.state.products;
    if (query.get('category')) list = list.filter((p) => p.category === query.get('category'));
    if (query.get('offer') === 'true') list = list.filter((p) => p.offer);
    const q = (query.get('q') || '').toLowerCase();
    if (q) list = list.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q));
    return { status: 200, body: list };
  });

  route('GET', '/api/products/:id', ({ params }) => {
    const product = db.state.products.find((p) => p.id === params.id);
    if (!product) throw new HttpError(404, 'Producto no encontrado.');
    return { status: 200, body: product };
  });

  route('POST', '/api/products', (ctx) => {
    requireAdmin(ctx);
    const product = { ...cleanProduct(ctx.body), id: makeId('p') };
    db.state.products.push(product);
    db.save();
    return { status: 201, body: product };
  });

  route('PUT', '/api/products/:id', (ctx) => {
    requireAdmin(ctx);
    const index = db.state.products.findIndex((p) => p.id === ctx.params.id);
    if (index < 0) throw new HttpError(404, 'Producto no encontrado.');
    db.state.products[index] = cleanProduct(ctx.body, db.state.products[index]);
    db.save();
    return { status: 200, body: db.state.products[index] };
  });

  route('DELETE', '/api/products/:id', (ctx) => {
    requireAdmin(ctx);
    const before = db.state.products.length;
    db.state.products = db.state.products.filter((p) => p.id !== ctx.params.id);
    if (db.state.products.length === before) throw new HttpError(404, 'Producto no encontrado.');
    db.save();
    return { status: 204 };
  });

  // ---------- Pedidos ----------
  // El cliente envía { customer, items: [{ id, quantity }] }. El precio y el total se calculan aquí.
  route('POST', '/api/orders', ({ body, auth }) => {
    const { customer, items } = body;
    if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'El carrito está vacío.');
    if (!customer || !String(customer.name || '').trim() || !EMAIL_RE.test(String(customer.email || '')) || !String(customer.address || '').trim()) {
      throw new HttpError(400, 'Nombre, correo y dirección son obligatorios.');
    }

    const lines = items.map(({ id, quantity }) => {
      const product = db.state.products.find((p) => p.id === id);
      const qty = Number(quantity);
      if (!product) throw new HttpError(400, `Producto inexistente: ${id}.`);
      if (!Number.isInteger(qty) || qty < 1) throw new HttpError(400, `Cantidad inválida para ${product.name}.`);
      return { product, qty };
    });
    // Validar stock completo antes de descontar nada
    for (const { product, qty } of lines) {
      if (qty > product.stock) throw new HttpError(409, `Stock insuficiente para "${product.name}" (disponible: ${product.stock}).`);
    }
    for (const { product, qty } of lines) product.stock -= qty;

    const order = {
      id: makeId('o'),
      userId: auth?.sub ?? null,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        address: customer.address.trim(),
        delivery: customer.delivery || 'Despacho a domicilio',
        payment: customer.payment || 'Tarjeta de débito'
      },
      items: lines.map(({ product, qty }) => ({ id: product.id, name: product.name, price: product.price, quantity: qty })),
      total: lines.reduce((sum, { product, qty }) => sum + product.price * qty, 0),
      createdAt: new Date().toISOString(),
      status: 'Confirmada'
    };
    db.state.orders.unshift(order);
    db.save();
    return { status: 201, body: order };
  });

  route('GET', '/api/orders', (ctx) => {
    const auth = requireAuth(ctx);
    const list = auth.role === 'admin' ? db.state.orders : db.state.orders.filter((o) => o.userId === auth.sub);
    return { status: 200, body: list };
  });

  // ---------- Servidor ----------
  const readBody = (req) => new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) { reject(new HttpError(413, 'Cuerpo demasiado grande.')); req.destroy(); }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new HttpError(400, 'JSON inválido.')); }
    });
    req.on('error', reject);
  });

  const send = (res, status, body) => {
    const headers = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };
    if (body === undefined) { res.writeHead(status, headers); return res.end(); }
    res.writeHead(status, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  };

  return createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204);
      const url = new URL(req.url, 'http://localhost');
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const match = r.regex.exec(url.pathname);
        if (!match) continue;
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
        const header = req.headers.authorization || '';
        const auth = header.startsWith('Bearer ') ? verifyToken(header.slice(7)) : null;
        const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : {};
        const result = await r.handler({ params, query: url.searchParams, body, auth });
        return send(res, result.status, result.body);
      }
      throw new HttpError(404, 'Ruta no encontrada.');
    } catch (err) {
      const status = err.status || 500;
      if (status === 500) console.error(err);
      send(res, status, { error: status === 500 ? 'Error interno del servidor.' : err.message });
    }
  });
}
