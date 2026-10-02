# Veterinaria San Marcos - Entrega 2

Aplicación frontend migrada a React con Vite y Bootstrap. Reemplaza la navegación HTML estática por componentes reutilizables y rutas React.

## Requisitos implementados

- Componentes React con responsabilidad única y navegación mediante React Router.
- Archivo `src/data/mockDb.js` con CRUD de productos, registro/autenticación de usuarios y creación de pedidos.
- Persistencia del catálogo, usuarios y pedidos en `localStorage`; sesión y carrito en `sessionStorage`/`localStorage`.
- Diseño responsive con Bootstrap.
- Vistas de categorías, ofertas, carrito, checkout, resultado de pago, ingreso, registro y panel administrativo.
- Pruebas Jasmine para el CRUD, más configuración de Karma para pruebas de navegador.

## Ejecutar

```bash
pnpm install
pnpm dev
```

Luego abre la URL que indique Vite. Para pruebas:

```bash
pnpm test
pnpm test:karma
```

Usuario administrador de demostración: `admin@sanmarcos.cl` / `Admin123!`.

## Estructura relevante

```text
src/
  components/   # Layout y tarjeta de producto
  context/      # Estado compartido de tienda y carrito
  data/         # Persistencia simulada y operaciones CRUD
  pages/        # Vistas de la aplicación
  styles/       # Estilos complementarios a Bootstrap
tests/          # Pruebas Jasmine y smoke test Karma
```
