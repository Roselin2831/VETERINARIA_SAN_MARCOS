# Integración frontend y API

La API base es `http://localhost:8080/api/v1` en desarrollo y `/api/v1` en Docker. Nginx reenvía las llamadas al backend. El navegador nunca se conecta directamente a MySQL.

| Módulo | Responsabilidad |
|---|---|
| services/api.js | Cliente fetch, Bearer, renovación compartida, un reintento y errores JSON |
| services/session.js | Persistencia de tokens y validación de expiración |
| context/AuthContext.jsx | Estado del usuario validado con /auth/me, recargas y cierre de sesión |
| components/ProtectedRoute.jsx | Restricciones de rutas por rol |
| pages/Seller.jsx | Consultas de productos y pedidos para VENDEDOR |
| pages/Admin.jsx | CRUD de productos, estados y asignación de roles para ADMIN |

| Función | CLIENTE | VENDEDOR | ADMIN |
|---|---|---|---|
| Comprar y ver pedidos propios | Sí | No | Sí |
| Consultar todos los pedidos y detalle | No | Sí | Sí |
| Modificar productos, estados o usuarios | No | No | Sí |

La sesión se recupera de localStorage y se revalida antes de mostrar rutas protegidas. La renovación rota el secreto en el servidor. Logout revoca la sesión. Una caída de red durante la renovación no borra las credenciales guardadas. Las respuestas pendientes no restauran una sesión cerrada. Los roles también se verifican en Spring Security en cada petición.

localStorage es accesible a JavaScript: una vulnerabilidad XSS podría exponer los tokens. La aplicación académica requiere HTTPS y medidas adicionales antes de un uso productivo con datos reales.

`npm test` prueba servicios y componentes reales con Jasmine/Karma. `npm run test:e2e` comprueba compra, roles, recarga, renovación, revocación y tamaños de pantalla. `src/data/mockDb.js` queda solo para pruebas de la etapa anterior y no alimenta el catálogo en ejecución.

El checkout registra pedidos. No realiza cobros bancarios ni emite boletas del SII.

La guía de Amazon Linux está en el repositorio backend: [despliegue](https://github.com/Angellssj/backend-veterinaria/blob/codex/mejoras-rubrica-ep3/DEPLOY-AMAZON-LINUX.md).
