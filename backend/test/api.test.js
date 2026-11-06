import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createDb } from '../src/db.js';
import { createApp } from '../src/app.js';

let server, base, adminToken, customerToken;

const call = async (method, path, body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
};

before(async () => {
  server = createApp(createDb(null)); // base de datos en memoria
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

test('health', async () => {
  assert.equal((await call('GET', '/api/health')).status, 200);
});

test('login admin y rechazo de credenciales malas', async () => {
  const bad = await call('POST', '/api/auth/login', { email: 'admin@sanmarcos.cl', password: 'x' });
  assert.equal(bad.status, 401);
  const ok = await call('POST', '/api/auth/login', { email: 'admin@sanmarcos.cl', password: 'Admin123!' });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.user.passwordHash, undefined);
  adminToken = ok.data.token;
});

test('registro de cliente y correo duplicado', async () => {
  const reg = await call('POST', '/api/auth/register', { name: 'Ana', email: 'ana@mail.cl', password: 'secreto1' });
  assert.equal(reg.status, 201);
  customerToken = reg.data.token;
  assert.equal((await call('POST', '/api/auth/register', { name: 'Ana', email: 'ANA@mail.cl', password: 'secreto1' })).status, 409);
  assert.equal((await call('GET', '/api/auth/me', null, customerToken)).data.user.email, 'ana@mail.cl');
});

test('productos: listar y filtrar', async () => {
  assert.equal((await call('GET', '/api/products')).data.length, 6);
  assert.equal((await call('GET', '/api/products?category=Salud')).data.length, 2);
  assert.equal((await call('GET', '/api/products?offer=true')).data.length, 3);
  assert.equal((await call('GET', '/api/products/nope')).status, 404);
});

test('CRUD de productos solo para admin', async () => {
  const item = { name: 'Collar', category: 'Salud', price: 5000, stock: 3, description: 'Collar' };
  assert.equal((await call('POST', '/api/products', item)).status, 401);
  assert.equal((await call('POST', '/api/products', item, customerToken)).status, 403);
  const created = await call('POST', '/api/products', item, adminToken);
  assert.equal(created.status, 201);
  const id = created.data.id;
  const updated = await call('PUT', `/api/products/${id}`, { price: 6000 }, adminToken);
  assert.equal(updated.data.price, 6000);
  assert.equal((await call('POST', '/api/products', { ...item, price: -1 }, adminToken)).status, 400);
  assert.equal((await call('DELETE', `/api/products/${id}`, null, adminToken)).status, 204);
  assert.equal((await call('GET', `/api/products/${id}`)).status, 404);
});

test('pedidos: total calculado en servidor y stock descontado', async () => {
  const customer = { name: 'Ana', email: 'ana@mail.cl', address: 'Calle 1, Rancagua' };
  const order = await call('POST', '/api/orders', { customer, items: [{ id: 'p1', quantity: 2 }, { id: 'p4', quantity: 1 }], total: 1 }, customerToken);
  assert.equal(order.status, 201);
  assert.equal(order.data.total, 18990 * 2 + 4290);
  assert.equal((await call('GET', '/api/products/p1')).data.stock, 14);
  // stock insuficiente no descuenta nada
  const fail = await call('POST', '/api/orders', { customer, items: [{ id: 'p4', quantity: 1 }, { id: 'p3', quantity: 999 }] });
  assert.equal(fail.status, 409);
  assert.equal((await call('GET', '/api/products/p4')).data.stock, 29);
  assert.equal((await call('POST', '/api/orders', { customer, items: [] })).status, 400);
});

test('listado de pedidos según rol', async () => {
  assert.equal((await call('GET', '/api/orders')).status, 401);
  assert.equal((await call('GET', '/api/orders', null, customerToken)).data.length, 1);
  assert.equal((await call('GET', '/api/orders', null, adminToken)).data.length, 1);
});
