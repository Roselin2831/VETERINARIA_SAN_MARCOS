# Veterinaria San Marcos — Frontend

Aplicación React/Vite conectada a la API REST Spring Boot del repositorio
[`Angellssj/backend-veterinaria`](https://github.com/Angellssj/backend-veterinaria).
El despliegue Docker Compose sirve esta aplicación mediante Nginx.

## Desarrollo local

Requiere Node.js 20 o superior. Con la API disponible en `http://localhost:8080`:

```powershell
npm ci
$env:VITE_API_URL = "http://localhost:8080/api/v1"
npm run dev
```

La URL de API también puede definirse en un archivo `.env` local (ignorado por Git).
La imagen Docker se compila por defecto con `VITE_API_URL=/api/v1`: el navegador llama a
la API en el mismo origen y Nginx la reenvía al contenedor `backend`.

## Amazon Linux y Docker Compose

La guía para desplegar ambos repositorios en la instancia existente está en
[DEPLOY-AMAZON-LINUX.md](https://github.com/Angellssj/backend-veterinaria/blob/codex/mejoras-rubrica-ep3/DEPLOY-AMAZON-LINUX.md).

Roles: CLIENTE compra y consulta sus pedidos; VENDEDOR consulta productos y pedidos
en `/vendedor`; ADMIN mantiene productos, estados y roles en `/admin`.

## Pruebas

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

`npm test` ejecuta Jasmine/Karma con componentes y servicios reales en Chrome Headless.
`npm run test:e2e` necesita la API local encendida con las cuentas de demostración.
`test:legacy` conserva las pruebas de datos simulados de la etapa anterior.

## Estructura de despliegue

Clona ambos repositorios en carpetas hermanas `backend` y `frontend` y ejecuta el
script de despliegue del backend (ver su `DEPLOY-EC2.md`):

```bash
git clone https://github.com/Angellssj/backend-veterinaria.git backend
git clone https://github.com/Roselin2831/VETERINARIA_SAN_MARCOS.git frontend
bash backend/deploy/ec2-deploy.sh
```

Nginx (`nginx.conf`) sirve el frontend en el puerto 80 y reenvía `/api`,
`/swagger-ui.html` y `/v3/api-docs` al backend Spring Boot. Todo funciona por el
puerto 80 sin depender de la IP pública; MySQL permanece en la red privada de Docker.

El backend de este proyecto es la API Spring Boot del repositorio indicado arriba.
(El backend Node y las páginas HTML estáticas de etapas anteriores se eliminaron;
siguen disponibles en el historial de Git.)
