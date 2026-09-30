# syntax=docker/dockerfile:1
# Imagen de la pantalla de AIPOS. Spec: specs/despliegue.spec.md, sección "Imagen de la pantalla".
# Dos etapas: la primera construye la pantalla con Vite; la segunda solo sirve el resultado con nginx, sin ser root.
# Construir: docker build --build-arg VITE_API_URL=https://aipos-back.salsalvador.io -t aipos-frontend frontend

FROM node:24-alpine AS construir
WORKDIR /app
# La dirección del backend (sin /api al final) se graba dentro del JavaScript al construir: cambiarla obliga a construir
# otra vez. Si llega vacía, la construcción falla, para no publicar una pantalla que llama a ninguna parte.
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || { echo "Falta VITE_API_URL: la pantalla no sabría a qué backend llamar." >&2; exit 1; }
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28-alpine
LABEL org.opencontainers.image.source="https://github.com/g14wx/AIPOS"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=construir /app/dist /usr/share/nginx/html
# nginx corre como el usuario nginx (no root) y escucha en el puerto 8080.
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/"]
