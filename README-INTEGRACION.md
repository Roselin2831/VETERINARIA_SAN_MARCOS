# Integración con el backend Spring Boot (EP3)

El frontend consume la API REST del backend Spring Boot de Veterinaria San Marcos.

## Ejecutar

1. Levanta el backend (ver su README) → http://localhost:8080/swagger-ui.html
2. En esta carpeta: `npm install` y `npm run dev` → http://localhost:5173
3. En modo Docker, configura las credenciales de administrador con `APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD` en `backend/.env`.

Para levantar frontend, backend y MySQL juntos con Docker Compose, sigue el
[README del proyecto](../README.md). En ese modo Flyway crea y actualiza el esquema
al iniciar el backend.

La URL de la API se cambia con `VITE_API_URL`. En desarrollo local es
`http://localhost:8080/api`; la imagen Docker la recibe al compilar desde
`backend/docker-compose.aws.yml`.

## Dónde está cada parte

| Archivo | Responsabilidad |
|---|---|
| `src/services/api.js` | Cliente HTTP único: agrega `Authorization: Bearer`, renueva el token y convierte errores |
| `src/services/session.js` | Guarda y lee la sesión (tokens + usuario) en `localStorage` |
| `src/services/*Service.js` | Llamadas por recurso: auth, productos, pedidos, usuarios |
| `src/context/AuthContext.jsx` | Estado de sesión; al recargar la valida con `GET /api/auth/me` |
| `src/context/ShopContext.jsx` | Catálogo desde la API y carrito en `localStorage` |
| `src/components/ProtectedRoute.jsx` | Rutas protegidas por sesión y rol |
| `src/pages/MyOrders.jsx`, `Forbidden.jsx` | Mis pedidos y página de acceso restringido |

## Rutas y permisos

| Ruta | Visitante | CLIENTE | ADMIN |
|---|---|---|---|
| `/`, `/categorias`, `/ofertas`, `/carrito` | ✓ | ✓ | ✓ |
| `/checkout`, `/resultado/:status`, `/mis-pedidos` | → login | ✓ | ✓ |
| `/admin` | → login | → acceso restringido | ✓ |

Notas:
- `src/data/mockDb.js` ya no lo usa la aplicación; se mantiene solo para las pruebas unitarias de la etapa anterior.
- En AWS, el navegador accede directamente al puerto 8080 del backend; el Security Group debe permitir ese tráfico y Spring debe tener el origen del frontend en `CORS_ALLOWED_ORIGINS`.
