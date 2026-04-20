# Etapa de construcción de Vue/Vite
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compilar proyecto optimizado para producción
RUN npm run build

# Etapa de servidor Nginx (ligero y rápido)
FROM nginx:alpine

# Limpiar posibles archivos basura de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Traer la carpeta "dist" recién compilada hacia el public HTML del Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Inyectar nuestra configuración del proxy inverso y routing de Vue
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
