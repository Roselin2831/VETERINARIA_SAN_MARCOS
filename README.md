# Veterinaria San Marcos — Frontend

Aplicación React/Vite conectada a la API REST Spring Boot del repositorio
[`Angellssj/backend-veterinaria`](https://github.com/Angellssj/backend-veterinaria).
El despliegue Docker Compose sirve esta aplicación mediante Nginx.

## Desarrollo local

Requiere Node.js 20 o superior. Con la API disponible en `http://localhost:8080`:

```powershell
npm ci
$env:VITE_API_URL = "http://localhost:8080/api"
npm run dev
```

La URL de API también puede definirse en un archivo `.env` local (ignorado por Git).
La imagen Docker se compila por defecto con `VITE_API_URL=/api`: el navegador llama a
la API en el mismo origen y Nginx la reenvía al contenedor `backend`.

## Docker Compose

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

La carpeta `backend/` de este repositorio corresponde a un backend Node heredado;
el despliegue actual utiliza el backend Spring Boot del repositorio indicado arriba.
