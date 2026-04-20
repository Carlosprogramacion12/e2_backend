# Etapa de construcción
FROM node:20-alpine AS build

WORKDIR /app

# Archivos de empaquetado iniciales
COPY package*.json ./
RUN npm install

# Copiar el todo el código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript a JavaScript en dist/
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Instalar solo las dependencias necesarias de producción
RUN npm install --omit=dev
# Instalar prisma CLI globalmente para poder usar db push al arrancar
RUN npm install -g prisma

# Copiar estructura del compilado y prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Crear carpeta de uploads
RUN mkdir -p uploads && chown -R node:node uploads

# Script de entrada para migrar la base de datos de manera automatizada al arrancar
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
