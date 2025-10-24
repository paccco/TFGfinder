# Dockerfile para la aplicación Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias e instalar
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto y definir el comando de inicio
EXPOSE 3000
CMD ["yarn", "start"]