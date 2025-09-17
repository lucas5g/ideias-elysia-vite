# Etapa 1: Build
FROM node:latest AS build

WORKDIR /app

# Copiar arquivos principais
COPY package.json package-lock.json ./ 
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:alpine

# Copiar build do Vite para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar config do Nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
