import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const api = process.env.API_URL || 'http://localhost:8080/api/v1';
const evidence = process.env.EVIDENCE_DIR;
async function capture(page, name) {
  if (!evidence) return;
  await fs.mkdir(evidence, { recursive: true });
  await page.screenshot({ path: path.join(evidence, `${name}.jpg`), type: 'jpeg', quality: 80, animations: 'disabled', timeout: 15_000 });
}
async function login(page, role) {
  await page.goto('/ingresar');
  await page.getByLabel('Correo electrónico').fill(`${role}@sanmarcos.cl`);
  await page.getByLabel('Contraseña', { exact: true }).fill({ admin: 'Admin123!', vendedor: 'Vendedor123!', cliente: 'Cliente123!' }[role]);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
}

test('cliente compra, conserva la sesión al recargar y no accede a administración', async ({ page }) => {
  await page.goto('/');
  await capture(page, '01-inicio');
  await page.goto('/ingresar');
  await capture(page, '02-ingreso');
  await login(page, 'cliente');
  await expect(page.getByText('Hola, Cliente')).toBeVisible();
  await page.goto('/categorias');
  await expect(page.locator('.pcard').first()).toBeVisible();
  await capture(page, '03-catalogo');
  await page.getByRole('button', { name: 'Agregar', exact: true }).first().click();
  await page.goto('/carrito');
  await capture(page, '04-carrito');
  await page.goto('/checkout');
  await page.getByLabel('Dirección', { exact: false }).fill('Avenida de prueba 123, Rancagua');
  await capture(page, '05-checkout');
  await page.getByRole('button', { name: /Confirmar|Finalizar|Pagar/ }).click();
  await expect(page).toHaveURL(/resultado\/exito/);
  await capture(page, '06-compra');
  await page.goto('/mis-pedidos');
  await expect(page.getByRole('heading', { name: /Pedido #/ }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Mis pedidos', exact: true })).toBeVisible();
  await capture(page, '07-mis-pedidos');
  await page.goto('/admin');
  await expect(page).toHaveURL(/no-autorizado/);
  await capture(page, '08-acceso-restringido');
});

test('vendedor solo ve consultas y el servidor bloquea sus escrituras', async ({ page, request }) => {
  const auth = await request.post(`${api}/auth/login`, { data: { email: 'cliente@sanmarcos.cl', password: 'Cliente123!' } });
  expect(auth.status()).toBe(200);
  const { accessToken } = await auth.json();
  const order = await request.post(`${api}/orders`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { name: 'Cliente Demo', email: 'cliente@sanmarcos.cl', address: 'Calle de prueba 123', items: [{ productId: 4, quantity: 1 }] }
  });
  expect(order.status()).toBe(201);
  await login(page, 'vendedor');
  await expect(page).toHaveURL(/vendedor/);
  await expect(page.getByRole('heading', { name: 'Productos y pedidos' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Administración', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Carrito/ })).toHaveCount(0);
  await page.getByText('Ver detalle de').first().click();
  await capture(page, '09-vendedor-productos');
  await page.getByRole('tab', { name: 'Pedidos', exact: true }).click();
  await expect(page.getByRole('button', { name: /Ver pedido #/ }).first()).toBeVisible();
  await page.getByRole('button', { name: /Ver pedido #/ }).first().click();
  await expect(page.getByRole('article', { name: /Detalle del pedido/ })).toBeVisible();
  await capture(page, '10-vendedor-pedidos');
  const token = await page.evaluate(() => JSON.parse(localStorage.getItem('san-marcos-session')).accessToken);
  const forbidden = await request.delete(`${api}/products/1`, { headers: { Authorization: `Bearer ${token}` } });
  expect(forbidden.status()).toBe(403);
  await page.goto('/carrito');
  await expect(page).toHaveURL(/vendedor/);
});

test('administrador crea, edita y elimina con foto persistida', async ({ page }) => {
  await login(page, 'admin');
  await expect(page).toHaveURL(/admin/);
  const name = `Collar de prueba ${Date.now()}`;
  await page.getByLabel('Nombre', { exact: true }).fill(name);
  await page.getByLabel('Precio', { exact: true }).fill('4500');
  await page.getByLabel('Stock', { exact: true }).fill('3');
  await page.getByLabel('Descripción', { exact: true }).fill('Collar de demostración para la evaluación');
  await page.getByRole('button', { name: 'Gato', exact: true }).click();
  await page.getByRole('button', { name: 'Crear producto', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toBeVisible();
  await expect(row.locator('img')).toHaveAttribute('src', '/img/productos/gato.webp');
  await capture(page, '11-admin-productos');
  await row.getByRole('button', { name: `Editar ${name}` }).click();
  await page.getByLabel('Precio', { exact: true }).fill('5000');
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await page.reload();
  await expect(row).toContainText('5.000');
  await page.getByRole('tab', { name: /Pedidos/ }).click();
  await capture(page, '12-admin-pedidos');
  await page.getByRole('tab', { name: /Usuarios/ }).click();
  await expect(page.getByLabel('Rol de Vendedor Demo')).toHaveValue('VENDEDOR');
  await capture(page, '13-admin-usuarios');
  await page.getByRole('tab', { name: /Productos/ }).click();
  page.on('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: `Eliminar ${name}` }).click();
  await expect(row).toHaveCount(0);
});

test('cerrar sesión revoca el acceso y no reaparece al recargar', async ({ page, request }) => {
  await login(page, 'cliente');
  await expect(page.getByText('Hola, Cliente')).toBeVisible();
  const token = await page.evaluate(() => JSON.parse(localStorage.getItem('san-marcos-session')).accessToken);
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Ingresar', exact: true }).first()).toBeVisible();
  await page.reload();
  await page.goto('/mis-pedidos');
  await expect(page).toHaveURL(/ingresar/);
  expect((await request.get(`${api}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(401);
});

test('renueva el acceso vencido al recargar sin reutilizar el refresh anterior', async ({ page, request }) => {
  await login(page, 'cliente');
  await expect(page.getByText('Hola, Cliente')).toBeVisible();
  const previous = await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem('san-marcos-session'));
    const old = session.refreshToken;
    session.accessToken = `header.${btoa(JSON.stringify({ exp: 1 }))}.signature`;
    localStorage.setItem('san-marcos-session', JSON.stringify(session));
    return old;
  });
  await page.reload();
  await expect(page.getByText('Hola, Cliente')).toBeVisible();
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem('san-marcos-session')));
  expect(session.refreshToken).not.toBe(previous);
  expect((await request.post(`${api}/auth/refresh`, { data: { refreshToken: previous } })).status()).toBe(401);
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('san-marcos-session'))).toBeNull();
});

test('las vistas principales no desbordan en móvil, tableta y escritorio', async ({ page }) => {
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/categorias', '/carrito', '/ingresar', '/registro']) {
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await login(page, 'vendedor');
  await expect(page).toHaveURL(/vendedor/);
  await page.setViewportSize({ width: 360, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await capture(page, '14-vendedor-movil');
});
