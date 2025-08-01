FROM node:22.14.0-bullseye

WORKDIR /myapp

# Copia solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala dependencias del proyecto (no globales)
RUN npm install

# Copia el resto del código fuente
COPY . .

COPY wait-for-it/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Si tienes un paso de build, descomenta la siguiente línea
# RUN npm run build

CMD ["npm", "run", "start:dev"]