# 07. Manual de Mantenimiento y Actualización

## 🔧 Introducción al Mantenimiento

Este manual proporciona guías detalladas para el mantenimiento, actualización y resolución de problemas del sistema **BackendIntranet**. Está dirigido a desarrolladores, administradores de sistema y personal técnico responsable del mantenimiento.

## 📋 Tareas de Mantenimiento Regular

### Mantenimiento Diario

#### Verificación de Estado del Sistema
```bash
# Verificar estado de contenedores
docker-compose ps

# Verificar logs de aplicación
docker-compose logs --tail=100 backend

# Verificar logs de base de datos
docker-compose logs --tail=100 mysqldb

# Verificar espacio en disco
df -h

# Verificar uso de memoria
free -h
```

#### Monitoreo de Rendimiento
```bash
# Verificar estadísticas de contenedores
docker stats

# Verificar conexiones de base de datos
docker exec -it mysql-db mysql -u root -p -e "SHOW PROCESSLIST;"

# Verificar métricas de aplicación
curl http://localhost:3000/health
```

### Mantenimiento Semanal

#### Backup de Base de Datos
```bash
#!/bin/bash
# backup-weekly.sh

# Configuración
DB_NAME="alejandria"
DB_USER="root"
DB_PASS="tu_password"
BACKUP_DIR="/backups/weekly"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio
mkdir -p $BACKUP_DIR

# Crear backup
docker exec mysql-db mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/backup_$DATE.sql

# Limpiar backups antiguos (más de 4 semanas)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +28 -delete

echo "Backup semanal completado: backup_$DATE.sql.gz"
```

#### Limpieza de Logs
```bash
#!/bin/bash
# cleanup-logs.sh

# Limpiar logs de Docker (más de 7 días)
docker system prune -f

# Limpiar logs de aplicación (más de 30 días)
find /var/log/ -name "*.log" -mtime +30 -delete

# Limpiar archivos temporales
find /tmp -type f -mtime +7 -delete

echo "Limpieza de logs completada"
```

### Mantenimiento Mensual

#### Actualización de Dependencias
```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias menores
npm update

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix
```

#### Optimización de Base de Datos
```sql
-- Optimizar tablas
OPTIMIZE TABLE usuarios;
OPTIMIZE TABLE asesoramientos;
OPTIMIZE TABLE contratos;
OPTIMIZE TABLE pagos;

-- Verificar integridad
CHECK TABLE usuarios;
CHECK TABLE asesoramientos;
CHECK TABLE contratos;
CHECK TABLE pagos;

-- Analizar tablas para optimización
ANALYZE TABLE usuarios;
ANALYZE TABLE asesoramientos;
ANALYZE TABLE contratos;
ANALYZE TABLE pagos;
```

## 🔄 Procesos de Actualización

### Actualización de Código

#### Preparación para Actualización
```bash
# 1. Hacer backup completo
./backup-database.sh

# 2. Crear rama de actualización
git checkout -b update/$(date +%Y%m%d)

# 3. Verificar estado actual
git status
```

#### Proceso de Actualización
```bash
# 1. Obtener últimos cambios
git fetch origin
git checkout main
git pull origin main

# 2. Instalar nuevas dependencias
npm install

# 3. Ejecutar migraciones
npm run migration:run

# 4. Ejecutar tests
npm run test

# 5. Construir aplicación
npm run build
```

#### Despliegue de Actualización
```bash
# 1. Detener servicios
docker-compose down

# 2. Construir nuevas imágenes
docker-compose build --no-cache

# 3. Iniciar servicios
docker-compose up -d

# 4. Verificar funcionamiento
docker-compose ps
curl http://localhost:3000/health
```

### Actualización de Base de Datos

#### Migraciones Automáticas
```bash
# Generar nueva migración
npm run migration:generate -- src/migrations/NombreMigracion

# Ejecutar migraciones pendientes
npm run migration:run

# Verificar estado de migraciones
npm run typeorm migration:show
```

#### Migraciones Manuales
```sql
-- Ejemplo de migración manual
-- 1. Crear tabla de respaldo
CREATE TABLE usuarios_backup AS SELECT * FROM usuarios;

-- 2. Aplicar cambios
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);

-- 3. Migrar datos si es necesario
UPDATE usuarios SET telefono = 'N/A' WHERE telefono IS NULL;

-- 4. Verificar integridad
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM usuarios_backup;

-- 5. Eliminar tabla de respaldo (solo si todo está bien)
-- DROP TABLE usuarios_backup;
```

### Actualización de Dependencias Críticas

#### Actualización de Node.js
```bash
# Verificar versión actual
node --version

# Usar nvm para cambiar versión
nvm install 20.0.0
nvm use 20.0.0

# Verificar compatibilidad
npm test
```

#### Actualización de Docker
```bash
# Actualizar Docker
sudo apt update
sudo apt upgrade docker.io

# Actualizar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🐛 Resolución de Problemas

### Problemas Comunes de Aplicación

#### Error: Puerto en uso
```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3000

# Matar proceso
sudo kill -9 PID

# O cambiar puerto en .env
LOCAL_API_PORT_ENV=3001
```

#### Error: Memoria insuficiente
```bash
# Verificar uso de memoria
free -h
docker stats

# Aumentar memoria para Docker
# Editar /etc/docker/daemon.json
{
  "default-runtime": "runc",
  "runtimes": {
    "runc": {
      "path": "runc"
    }
  },
  "default-shm-size": "2g"
}

# Reiniciar Docker
sudo systemctl restart docker
```

#### Error: Base de datos no responde
```bash
# Verificar estado de MySQL
docker exec mysql-db mysqladmin ping

# Reiniciar MySQL
docker-compose restart mysqldb

# Verificar logs
docker-compose logs mysqldb

# Verificar configuración
docker exec mysql-db mysql -u root -p -e "SHOW VARIABLES LIKE 'max_connections';"
```

### Problemas de Rendimiento

#### Consultas Lentas
```sql
-- Identificar consultas lentas
SHOW PROCESSLIST;

-- Habilitar log de consultas lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Verificar índices
SHOW INDEX FROM usuarios;
SHOW INDEX FROM asesoramientos;

-- Crear índices faltantes
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_asesoramientos_estado ON asesoramientos(estado);
```

#### Optimización de Memoria
```bash
# Verificar configuración de MySQL
docker exec mysql-db mysql -u root -p -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"

# Ajustar configuración en docker-compose.yml
environment:
  - MYSQL_INNODB_BUFFER_POOL_SIZE=512M
  - MYSQL_INNODB_LOG_FILE_SIZE=64M
```

### Problemas de Seguridad

#### Vulnerabilidades de Dependencias
```bash
# Auditar dependencias
npm audit

# Corregir vulnerabilidades
npm audit fix

# Actualizar dependencias vulnerables
npm update package-name

# Verificar después de corrección
npm audit
```

#### Configuración de Seguridad
```bash
# Verificar permisos de archivos
ls -la .env
chmod 600 .env

# Verificar configuración de JWT
grep JWT_SECRET .env

# Rotar secretos si es necesario
# Generar nuevo JWT_SECRET
openssl rand -base64 32
```

## 📊 Monitoreo y Alertas

### Configuración de Monitoreo

#### Script de Monitoreo Básico
```bash
#!/bin/bash
# monitor.sh

# Verificar estado de servicios
if ! docker-compose ps | grep -q "Up"; then
    echo "ALERTA: Servicios no están corriendo"
    # Enviar notificación
fi

# Verificar uso de CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "ALERTA: Uso de CPU alto: $CPU_USAGE%"
fi

# Verificar uso de memoria
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "ALERTA: Uso de memoria alto: $MEMORY_USAGE%"
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
if [ $DISK_USAGE -gt 85 ]; then
    echo "ALERTA: Espacio en disco bajo: $DISK_USAGE%"
fi
```

#### Configuración de Logs
```bash
# Configurar rotación de logs
# Crear /etc/logrotate.d/docker-compose
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

### Alertas Automáticas

#### Script de Alertas por Email
```bash
#!/bin/bash
# alerts.sh

# Configuración de email
EMAIL="admin@empresa.com"
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT="587"

# Función para enviar email
send_alert() {
    local subject="$1"
    local message="$2"
    
    echo "$message" | mail -s "$subject" -S smtp="$SMTP_SERVER:$SMTP_PORT" $EMAIL
}

# Verificar servicios
if ! docker-compose ps | grep -q "Up"; then
    send_alert "ALERTA: Servicios caídos" "Los servicios del sistema no están corriendo"
fi

# Verificar base de datos
if ! docker exec mysql-db mysqladmin ping > /dev/null 2>&1; then
    send_alert "ALERTA: Base de datos no responde" "MySQL no está respondiendo"
fi
```

## 🔒 Buenas Prácticas de Mantenimiento

### Gestión de Configuración

#### Control de Versiones
```bash
# Commit de cambios de configuración
git add docker-compose.yml .env.example
git commit -m "feat: actualizar configuración de producción"

# Tag de versiones
git tag -a v1.2.0 -m "Versión 1.2.0 - Nueva funcionalidad X"
git push origin v1.2.0
```

#### Documentación de Cambios
```markdown
# CHANGELOG.md

## [1.2.0] - 2024-01-15

### Added
- Nueva funcionalidad de reportes
- Integración con sistema de pagos externo

### Changed
- Optimización de consultas de base de datos
- Mejora en la interfaz de usuario

### Fixed
- Corrección de bug en gestión de contratos
- Resolución de problema de memoria
```

### Pruebas de Regresión

#### Suite de Pruebas Automatizadas
```bash
#!/bin/bash
# regression-tests.sh

echo "Ejecutando pruebas de regresión..."

# Pruebas unitarias
npm run test

# Pruebas de integración
npm run test:e2e

# Pruebas de carga básicas
npm run test:load

# Verificar endpoints críticos
curl -f http://localhost:3000/health || exit 1
curl -f http://localhost:3000/auth/login || exit 1

echo "Todas las pruebas pasaron correctamente"
```

### Gestión de Incidentes

#### Procedimiento de Incidentes
1. **Detección**: Monitoreo automático o reporte manual
2. **Clasificación**: Severidad (Crítica, Alta, Media, Baja)
3. **Contención**: Aislar el problema
4. **Diagnóstico**: Identificar causa raíz
5. **Resolución**: Implementar solución
6. **Verificación**: Confirmar que el problema está resuelto
7. **Documentación**: Registrar incidente y solución

#### Plantilla de Incidente
```markdown
# Incidente #INC-2024-001

## Información Básica
- **Fecha**: 2024-01-15
- **Hora**: 14:30
- **Severidad**: Alta
- **Estado**: Resuelto

## Descripción
El sistema no responde a peticiones de autenticación.

## Impacto
- Usuarios no pueden iniciar sesión
- Sistema inaccesible para 2 horas

## Causa Raíz
Problema de configuración en JWT secret.

## Solución
- Rotar JWT secret
- Reiniciar servicios
- Verificar funcionamiento

## Acciones Preventivas
- Implementar monitoreo de JWT
- Documentar proceso de rotación de secretos
```

## 📈 Optimización Continua

### Métricas de Rendimiento

#### Script de Métricas
```bash
#!/bin/bash
# metrics.sh

# Métricas de aplicación
echo "=== Métricas de Aplicación ==="
curl -s http://localhost:3000/metrics | jq .

# Métricas de base de datos
echo "=== Métricas de Base de Datos ==="
docker exec mysql-db mysql -u root -p -e "
SELECT 
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'alejandria'
ORDER BY (data_length + index_length) DESC;
"

# Métricas de sistema
echo "=== Métricas de Sistema ==="
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
echo "Memoria: $(free | grep Mem | awk '{printf "%.2f%%", $3/$2 * 100.0}')"
echo "Disco: $(df / | tail -1 | awk '{print $5}')"
```

### Optimización de Consultas

#### Análisis de Consultas Lentas
```sql
-- Habilitar log de consultas lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Ver consultas lentas
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log 
ORDER BY query_time DESC 
LIMIT 10;
```

#### Optimización de Índices
```sql
-- Analizar uso de índices
SELECT 
    table_name,
    index_name,
    cardinality,
    sub_part,
    packed
FROM information_schema.statistics 
WHERE table_schema = 'alejandria'
ORDER BY table_name, cardinality DESC;

-- Crear índices faltantes basados en consultas frecuentes
CREATE INDEX idx_asesoramientos_cliente_fecha ON asesoramientos(id_cliente, fecha_inicio);
CREATE INDEX idx_pagos_contrato_estado ON pagos(id_contrato, estado);
```

## 🔄 Plan de Recuperación ante Desastres

### Estrategia de Backup

#### Backup Completo del Sistema
```bash
#!/bin/bash
# full-backup.sh

BACKUP_DIR="/backups/full"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio
mkdir -p $BACKUP_DIR/$DATE

# Backup de base de datos
docker exec mysql-db mysqldump -u root -p$DB_PASS --all-databases > $BACKUP_DIR/$DATE/database.sql

# Backup de archivos de aplicación
tar -czf $BACKUP_DIR/$DATE/application.tar.gz src/ static/ package.json

# Backup de configuración
cp docker-compose.yml $BACKUP_DIR/$DATE/
cp .env $BACKUP_DIR/$DATE/

# Backup de logs
tar -czf $BACKUP_DIR/$DATE/logs.tar.gz logs/

echo "Backup completo creado en: $BACKUP_DIR/$DATE"
```

### Procedimiento de Recuperación

#### Recuperación Completa
```bash
#!/bin/bash
# restore.sh

BACKUP_DATE=$1
BACKUP_DIR="/backups/full/$BACKUP_DATE"

if [ -z "$BACKUP_DATE" ]; then
    echo "Uso: $0 YYYYMMDD_HHMMSS"
    exit 1
fi

# Detener servicios
docker-compose down

# Restaurar base de datos
docker-compose up -d mysqldb
sleep 30
docker exec -i mysql-db mysql -u root -p$DB_PASS < $BACKUP_DIR/database.sql

# Restaurar archivos de aplicación
tar -xzf $BACKUP_DIR/application.tar.gz

# Restaurar configuración
cp $BACKUP_DIR/docker-compose.yml .
cp $BACKUP_DIR/.env .

# Iniciar servicios
docker-compose up -d

echo "Recuperación completada desde: $BACKUP_DATE"
```

## 📚 Documentación y Capacitación

### Mantenimiento de Documentación

#### Actualización de Documentación
- Revisar documentación después de cada actualización
- Actualizar diagramas cuando cambie la arquitectura
- Mantener changelog actualizado
- Documentar nuevos procedimientos

#### Capacitación del Equipo
- Sesiones de capacitación mensuales
- Documentación de procedimientos
- Simulacros de recuperación
- Evaluación de conocimientos

### Herramientas de Mantenimiento

#### Scripts de Automatización
- Scripts de backup automatizados
- Scripts de monitoreo
- Scripts de despliegue
- Scripts de limpieza

#### Herramientas de Monitoreo
- Prometheus para métricas
- Grafana para visualización
- ELK Stack para logs
- Alertmanager para notificaciones
