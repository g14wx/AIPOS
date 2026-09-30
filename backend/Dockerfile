# syntax=docker/dockerfile:1
# Imagen del backend de AIPOS. Spec: specs/despliegue.spec.md, sección "Imagen del backend".
# Dos etapas: la primera instala solo las dependencias de producción; la segunda copia lo que hace falta para correr.

FROM node:24-alpine AS dependencias
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:24-alpine
LABEL org.opencontainers.image.source="https://github.com/g14wx/AIPOS"
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencias /app/node_modules ./node_modules
COPY package.json .sequelizerc ./
COPY db ./db
COPY src ./src
COPY docs ./docs
# No trae un .env: las variables llegan del entorno del contenedor (src/config.js le da prioridad al entorno).
USER node
EXPOSE 3000
# La orden que Docker repite para saber si el backend está sano: usa el fetch de Node, sin instalar curl.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/salud').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "src/servidor.js"]
