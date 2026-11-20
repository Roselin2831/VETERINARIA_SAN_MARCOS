FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# "/api" = mismo origen; Nginx reenvía al contenedor backend. No depende de la IP pública.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN if [ -z "$VITE_API_URL" ]; then echo "VITE_API_URL must be set at build time" >&2; exit 1; fi \
    && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
