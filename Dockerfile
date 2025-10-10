FROM node:22.14.0-bullseye

# Establecer directorio de trabajo
WORKDIR /myapp

RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Copiar solo archivos necesarios para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Copiar el script wait-for-it
COPY wait-for-it/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Compilar la aplicación NestJS
RUN npm run build

# Exponer el puerto
EXPOSE 3001

# Comando final: Docker Compose lo sobreescribe, pero está bien tenerlo
CMD ["node", "dist/src/main"]

