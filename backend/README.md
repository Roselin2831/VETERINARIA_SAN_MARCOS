# Backend – Veterinaria San Marcos

API REST básica en Node.js **sin dependencias externas** (solo módulos nativos). Requiere Node 18 o superior.

## Ejecutar

```bash
cd backend
npm start        # http://localhost:3001
npm run dev      # reinicia al guardar cambios
npm test         # 7 pruebas de la API
```

Los datos se guardan en `backend/data/db.json` (se crea solo al primer arranque con los 6 productos del catálogo y el admin). Para reiniciar la base, borra ese archivo.

## Variables de entorno (opcionales)

| Variable | Por defecto | Uso |
|---|---|---|
| `PORT` | `3001` | Puerto |
| `JWT_SECRET` | valor de ejemplo | **Cámbialo** fuera de desarrollo |
| `CORS_ORIGIN` | `*` | Ej: `http://localhost:5173` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@sanmarcos.cl` / `Admin123!` | Admin inicial (solo al crear la base) |
| `DB_FILE` | `backend/data/db.json` | Ruta del archivo de datos |

## Endpoints

Autenticación con cabecera `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | público | Estado del servicio |
| POST | `/api/auth/register` | público | `{ name, email, password }` → `{ user, token }` |
| POST | `/api/auth/login` | público | `{ email, password }` → `{ user, token }` |
| GET | `/api/auth/me` | sesión | Usuario actual |
| GET | `/api/products` | público | Filtros: `?category=Salud&offer=true&q=perro` |
| GET | `/api/products/:id` | público | Un producto |
| POST | `/api/products` | admin | Crear producto |
| PUT | `/api/products/:id` | admin | Editar producto |
| DELETE | `/api/products/:id` | admin | Eliminar producto |
| POST | `/api/orders` | público (o sesión) | `{ customer: { name, email, address, delivery, payment }, items: [{ id, quantity }] }` |
| GET | `/api/orders` | sesión | Admin ve todos; cliente solo los suyos |

Notas:
- El **total y los precios del pedido se calculan en el servidor**; el stock se descuenta al confirmar y se rechaza con `409` si no alcanza.
- Las contraseñas se guardan con scrypt (nunca en texto plano).
- Errores: `{ "error": "mensaje" }` con el código HTTP correspondiente.

## Conectar con el frontend

Hoy el frontend usa `src/data/mockDb.js` (localStorage). Para usar esta API, reemplaza cada función por un `fetch` a `http://localhost:3001/api/...`, por ejemplo:

```js
const API = 'http://localhost:3001/api';
export const readProducts = () => fetch(`${API}/products`).then((r) => r.json());
export const authenticate = (email, password) =>
  fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; });
```

Guarda el `token` en `sessionStorage` y envíalo en las llamadas de administración.

## Ideas para después
Migrar a MySQL (según el README principal), agregar mascotas y citas, límite de intentos de login y despliegue con Docker.
