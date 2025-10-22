# 05. Manual de Instalación y Despliegue

## 📋 Prerrequisitos del Sistema

### Requisitos Mínimos

#### Hardware
- **CPU**: 2 cores mínimo, 4 cores recomendado
- **RAM**: 4GB mínimo, 8GB recomendado
- **Almacenamiento**: 20GB de espacio libre
- **Red**: Conexión a internet estable

#### Software
- **Sistema Operativo**: 
  - Windows 10/11
  - macOS 10.15+
  - Linux (Ubuntu 20.04+, CentOS 8+)
- **Node.js**: Versión 18.0.0 o superior
- **npm**: Versión 8.0.0 o superior
- **Docker**: Versión 20.10.0 o superior
- **Docker Compose**: Versión 2.0.0 o superior
- **Git**: Para clonar el repositorio

### Verificación de Prerrequisitos

```bash
# Verificar Node.js
node --version
# Debe mostrar v18.0.0 o superior

# Verificar npm
npm --version
# Debe mostrar 8.0.0 o superior

# Verificar Docker
docker --version
# Debe mostrar 20.10.0 o superior

# Verificar Docker Compose
docker-compose --version
# Debe mostrar 2.0.0 o superior

# Verificar Git
git --version
# Debe mostrar cualquier versión reciente
```

## 🚀 Instalación Local (Desarrollo)

### Paso 1: Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <repository-url>
cd BackendIntranet

# Verificar la estructura del proyecto
ls -la
```

### Paso 2: Configurar Variables de Entorno

```bash
# Crear archivo de variables de entorno
cp .env.example .env

# Editar el archivo .env con tus configuraciones
nano .env
```

#### Configuración del archivo .env

```env
# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password_mysql
DB_NAME=alejandria

# ===========================================
# CONFIGURACIÓN JWT
# ===========================================
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# ===========================================
# CONFIGURACIÓN DE EMAIL
# ===========================================
GMAIL=tu_email@gmail.com
GMAIL_PASSWORD=tu_app_password_gmail

# ===========================================
# CONFIGURACIÓN BACKBLAZE B2
# ===========================================
B2_KEY_ID=tu_backblaze_key_id
B2_APP_KEY=tu_backblaze_app_key
BUCKET_ID=tu_bucket_id
BUCKET_NAME=tu_bucket_name

# ===========================================
# CONFIGURACIÓN DOCKER
# ===========================================
MYSQL_USER_ENV=root
MYSQL_PASSWORD_ENV=tu_password_mysql
MYSQL_ROOT_PASSWORD_ENV=tu_root_password_mysql
MYSQL_DATABASE_ENV=alejandria
MYSQLDB_LOCAL_PORT_ENV=3306
MYSQLDB_DOCKER_PORT_ENV=3306
LOCAL_API_PORT_ENV=3000
DOCKER_API_PORT_ENV=3000
DB_PORT_ENV=3306
MYSQL_ROOT_ENV=root
FRONT_PORT_ENV=3001

# ===========================================
# CONFIGURACIÓN DE SECTORES (OPCIONAL)
# ===========================================
SECTOR1_EMAIL=sector1@empresa.com
SECTOR1_CLIENT_ID=client_id_sector1
SECTOR1_CLIENT_SECRET=client_secret_sector1
SECTOR1_ACCOUNT_ID=account_id_sector1

SECTOR2_EMAIL=sector2@empresa.com
SECTOR2_CLIENT_ID=client_id_sector2
SECTOR2_CLIENT_SECRET=client_secret_sector2
SECTOR2_ACCOUNT_ID=account_id_sector2
```

### Paso 3: Instalar Dependencias

```bash
# Instalar dependencias de Node.js
npm install

# Verificar que la instalación fue exitosa
npm list --depth=0
```

### Paso 4: Configurar Base de Datos

#### Opción A: Usar Docker (Recomendado)

```bash
# Iniciar solo la base de datos
docker-compose up mysqldb -d

# Verificar que el contenedor esté corriendo
docker ps

# Esperar a que MySQL esté listo (30-60 segundos)
docker logs mysql-db
```

#### Opción B: Instalación Manual de MySQL

```bash
# En Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# En CentOS/RHEL
sudo yum install mysql-server

# En macOS con Homebrew
brew install mysql

# Iniciar MySQL
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# Configurar MySQL
sudo mysql_secure_installation
```

### Paso 5: Ejecutar Migraciones

```bash
# Ejecutar migraciones de base de datos
npm run migration:run

# Verificar que las tablas se crearon
npm run typeorm schema:log
```

### Paso 6: Iniciar la Aplicación

```bash
# Modo desarrollo con hot-reload
npm run start:dev

# Verificar que la aplicación esté corriendo
curl http://localhost:3000
```

## 🐳 Instalación con Docker (Producción)

### Paso 1: Preparar el Entorno

```bash
# Clonar el repositorio
git clone <repository-url>
cd BackendIntranet

# Crear archivo .env para producción
cp .env.example .env.production
```

### Paso 2: Configurar Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mysqldb:
    image: mysql:8
    container_name: mysql-db-prod
    environment:
      - MYSQL_USER=${MYSQL_USER_ENV}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD_ENV}
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD_ENV}
      - MYSQL_DATABASE=${MYSQL_DATABASE_ENV}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: nest-backend-prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysqldb
      - DB_PORT=3306
      - DB_NAME=${MYSQL_DATABASE_ENV}
      - DB_USER=${MYSQL_ROOT_ENV}
      - DB_PASSWORD=${MYSQL_PASSWORD_ENV}
      - JWT_SECRET=${JWT_SECRET}
      - GMAIL=${GMAIL}
      - GMAIL_PASSWORD=${GMAIL_PASSWORD}
      - B2_KEY_ID=${B2_KEY_ID}
      - B2_APP_KEY=${B2_APP_KEY}
      - BUCKET_ID=${BUCKET_ID}
      - BUCKET_NAME=${BUCKET_NAME}
    depends_on:
      - mysqldb
    volumes:
      - ./static:/app/static
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  mysql_data:
```

### Paso 3: Construir y Ejecutar

```bash
# Construir las imágenes
docker-compose -f docker-compose.prod.yml build

# Ejecutar en modo detached
docker-compose -f docker-compose.prod.yml up -d

# Verificar el estado de los contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs de la aplicación
docker-compose -f docker-compose.prod.yml logs -f backend
```

## 🔧 Configuración Avanzada

### Configuración de Nginx (Reverso Proxy)

```nginx
# /etc/nginx/sites-available/backendintranet
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Configuración de SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### Configuración de Backup de Base de Datos

```bash
#!/bin/bash
# backup-database.sh

# Configuración
DB_NAME="alejandria"
DB_USER="root"
DB_PASS="tu_password"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Crear backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completado: backup_$DATE.sql.gz"
```

## 🔍 Verificación de la Instalación

### Verificar Servicios

```bash
# Verificar que la API esté respondiendo
curl -X GET http://localhost:3000

# Verificar endpoint de salud
curl -X GET http://localhost:3000/health

# Verificar base de datos
docker exec -it mysql-db mysql -u root -p -e "SHOW DATABASES;"
```

### Verificar Logs

```bash
# Logs de la aplicación
docker-compose logs backend

# Logs de la base de datos
docker-compose logs mysqldb

# Logs en tiempo real
docker-compose logs -f
```

### Pruebas de Funcionalidad

```bash
# Probar endpoint de login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Probar endpoint de usuarios
curl -X GET http://localhost:3000/usuarios \
  -H "Authorization: Bearer tu_jwt_token"
```

## 🚨 Solución de Problemas Comunes

### Error: Puerto ya en uso

```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3000

# Matar el proceso
sudo kill -9 PID_DEL_PROCESO

# O cambiar el puerto en .env
LOCAL_API_PORT_ENV=3001
```

### Error: No se puede conectar a MySQL

```bash
# Verificar que MySQL esté corriendo
docker ps | grep mysql

# Verificar logs de MySQL
docker logs mysql-db

# Reiniciar MySQL
docker-compose restart mysqldb
```

### Error: Variables de entorno no cargadas

```bash
# Verificar que el archivo .env existe
ls -la .env

# Verificar contenido del archivo
cat .env

# Reiniciar la aplicación
docker-compose restart backend
```

### Error: Migraciones fallan

```bash
# Verificar conexión a la base de datos
npm run typeorm query "SELECT 1"

# Ejecutar migraciones manualmente
npm run typeorm migration:run

# Revertir migración si es necesario
npm run typeorm migration:revert
```

## 📊 Monitoreo Post-Instalación

### Métricas de Sistema

```bash
# Uso de CPU y memoria
docker stats

# Espacio en disco
df -h

# Logs del sistema
journalctl -u docker
```

### Métricas de Aplicación

```bash
# Verificar endpoints de salud
curl http://localhost:3000/health

# Verificar métricas de base de datos
docker exec -it mysql-db mysql -u root -p -e "SHOW PROCESSLIST;"
```

## 🔄 Actualización del Sistema

### Actualización de Código

```bash
# Hacer backup de la base de datos
./backup-database.sh

# Obtener últimos cambios
git pull origin main

# Instalar nuevas dependencias
npm install

# Ejecutar nuevas migraciones
npm run migration:run

# Reiniciar servicios
docker-compose restart
```

### Actualización de Dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias menores
npm update

# Actualizar dependencias mayores (cuidado)
npm install package@latest
```

## 📝 Notas Importantes

### Seguridad

- Cambiar todas las contraseñas por defecto
- Usar JWT secrets seguros y únicos
- Configurar firewall apropiadamente
- Mantener dependencias actualizadas

### Rendimiento

- Configurar índices de base de datos apropiados
- Monitorear uso de recursos
- Implementar caching cuando sea necesario
- Optimizar consultas de base de datos

### Mantenimiento

- Ejecutar backups regulares
- Monitorear logs de aplicación
- Actualizar dependencias regularmente
- Documentar cambios y configuraciones
