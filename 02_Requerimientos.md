# 02. Especificación de Requerimientos (SRS)

## 📋 Requerimientos Funcionales

### RF-001: Gestión de Usuarios

#### RF-001.1: Autenticación y Autorización
- **Descripción**: El sistema debe permitir el login de usuarios con diferentes roles
- **Prioridad**: Alta
- **Criterios de Aceptación**:
  - Login con username/email y contraseña
  - Generación de token JWT para sesiones
  - Recuperación de contraseña por email
  - Cambio de contraseña autenticado
  - Control de acceso basado en roles

#### RF-001.2: Gestión de Roles
- **Descripción**: El sistema debe soportar múltiples roles de usuario
- **Prioridad**: Alta
- **Roles Soportados**:
  - `admin`: Administrador del sistema
  - `asesor`: Asesor académico
  - `estudiante`: Cliente/estudiante
  - `jefe_operaciones`: Jefe de operaciones
  - `supervisor`: Supervisor de área
  - `contrato_pago`: Gestor de contratos y pagos
  - `asesor_inducciones`: Asesor de inducciones
  - `soporte`: Personal de soporte técnico
  - `marketing`: Personal de marketing

### RF-002: Gestión de Asesorías

#### RF-002.1: Procesos de Asesoría
- **Descripción**: El sistema debe gestionar el ciclo completo de asesorías académicas
- **Prioridad**: Alta
- **Funcionalidades**:
  - Creación de solicitudes de asesoría
  - Asignación de asesores a solicitudes
  - Seguimiento del estado del proceso
  - Gestión de documentos relacionados
  - Historial de asesorías

#### RF-002.2: Gestión de Asuntos
- **Descripción**: El sistema debe permitir la gestión de asuntos específicos
- **Prioridad**: Media
- **Funcionalidades**:
  - Creación y edición de asuntos
  - Categorización de asuntos
  - Asignación de prioridades
  - Seguimiento de resolución

### RF-003: Gestión de Contratos

#### RF-003.1: Creación de Contratos
- **Descripción**: El sistema debe permitir la creación y gestión de contratos
- **Prioridad**: Alta
- **Funcionalidades**:
  - Creación de contratos basados en asesorías
  - Carga de documentos adjuntos
  - Edición de contratos existentes
  - Generación de PDFs de contratos

#### RF-003.2: Tipos de Contrato
- **Descripción**: El sistema debe soportar diferentes tipos de contrato
- **Prioridad**: Media
- **Tipos Soportados**:
  - Contratos de asesoría individual
  - Contratos de asesoría grupal
  - Contratos de consultoría especializada

### RF-004: Sistema de Pagos

#### RF-004.1: Gestión de Pagos
- **Descripción**: El sistema debe gestionar el procesamiento de pagos
- **Prioridad**: Alta
- **Funcionalidades**:
  - Registro de pagos
  - Seguimiento de pagos pendientes
  - Generación de facturas
  - Historial de transacciones

#### RF-004.2: Información de Pagos
- **Descripción**: El sistema debe almacenar información detallada de pagos
- **Prioridad**: Media
- **Funcionalidades**:
  - Datos bancarios del cliente
  - Métodos de pago aceptados
  - Estados de pago (pendiente, procesado, fallido)

### RF-005: Gestión de Recursos

#### RF-005.1: Recursos Educativos
- **Descripción**: El sistema debe proporcionar acceso a recursos educativos
- **Prioridad**: Media
- **Tipos de Recursos**:
  - Guías de estudio
  - Tutoriales paso a paso
  - Herramientas de apoyo
  - Noticias y actualizaciones
  - Soluciones a problemas comunes

#### RF-005.2: Gestión de Documentos
- **Descripción**: El sistema debe permitir la carga y gestión de documentos
- **Prioridad**: Alta
- **Funcionalidades**:
  - Carga de archivos múltiples
  - Almacenamiento en Backblaze B2
  - Categorización de documentos
  - Control de versiones

### RF-006: Sistema de Reuniones

#### RF-006.1: Calendario de Reuniones
- **Descripción**: El sistema debe gestionar reuniones programadas
- **Prioridad**: Alta
- **Funcionalidades**:
  - Programación de reuniones
  - Calendario por asesor
  - Calendario por estudiante
  - Notificaciones de reuniones
  - Gestión de disponibilidad

### RF-007: Sistema de Soporte

#### RF-007.1: Gestión de Tickets
- **Descripción**: El sistema debe gestionar tickets de soporte
- **Prioridad**: Media
- **Funcionalidades**:
  - Creación de tickets
  - Asignación de tickets
  - Seguimiento de estado
  - Resolución de tickets

### RF-008: Sistema de Notificaciones

#### RF-008.1: Notificaciones del Sistema
- **Descripción**: El sistema debe enviar notificaciones a usuarios
- **Prioridad**: Media
- **Funcionalidades**:
  - Notificaciones por email
  - Notificaciones en tiempo real
  - Configuración de preferencias
  - Historial de notificaciones

## 🔧 Requerimientos No Funcionales

### RNF-001: Rendimiento

#### RNF-001.1: Tiempo de Respuesta
- **Descripción**: El sistema debe responder a las peticiones en tiempo adecuado
- **Criterios**:
  - Respuesta de API: < 2 segundos
  - Carga de páginas: < 3 segundos
  - Procesamiento de archivos: < 10 segundos

#### RNF-001.2: Throughput
- **Descripción**: El sistema debe soportar un número específico de usuarios concurrentes
- **Criterios**:
  - 100 usuarios concurrentes
  - 1000 peticiones por minuto
  - 99.9% de disponibilidad

### RNF-002: Seguridad

#### RNF-002.1: Autenticación
- **Descripción**: El sistema debe implementar medidas de seguridad robustas
- **Criterios**:
  - Encriptación de contraseñas con bcrypt
  - Tokens JWT con expiración
  - Rate limiting en endpoints de autenticación
  - Validación de entrada en todos los endpoints

#### RNF-002.2: Autorización
- **Descripción**: El sistema debe controlar el acceso a recursos
- **Criterios**:
  - Control de acceso basado en roles (RBAC)
  - Validación de permisos en cada endpoint
  - Auditoría de accesos

#### RNF-002.3: Protección de Datos
- **Descripción**: El sistema debe proteger la información sensible
- **Criterios**:
  - Encriptación de datos sensibles
  - Conexiones HTTPS
  - Validación y sanitización de entrada
  - Logs de auditoría

### RNF-003: Escalabilidad

#### RNF-003.1: Escalabilidad Horizontal
- **Descripción**: El sistema debe poder escalar horizontalmente
- **Criterios**:
  - Arquitectura de microservicios
  - Base de datos optimizada para consultas
  - Caching estratégico
  - Load balancing

#### RNF-003.2: Escalabilidad de Datos
- **Descripción**: El sistema debe manejar grandes volúmenes de datos
- **Criterios**:
  - Índices optimizados en base de datos
  - Paginación en consultas grandes
  - Almacenamiento en la nube para archivos

### RNF-004: Disponibilidad

#### RNF-004.1: Uptime
- **Descripción**: El sistema debe estar disponible la mayor parte del tiempo
- **Criterios**:
  - 99.9% de uptime
  - Recuperación automática de fallos
  - Monitoreo continuo

#### RNF-004.2: Recuperación
- **Descripción**: El sistema debe poder recuperarse de fallos
- **Criterios**:
  - Backup automático de base de datos
  - Recuperación en < 4 horas
  - Plan de contingencia documentado

### RNF-005: Usabilidad

#### RNF-005.1: Interfaz de Usuario
- **Descripción**: El sistema debe ser fácil de usar
- **Criterios**:
  - Interfaz intuitiva
  - Documentación de usuario completa
  - Mensajes de error claros
  - Navegación consistente

#### RNF-005.2: Accesibilidad
- **Descripción**: El sistema debe ser accesible para diferentes usuarios
- **Criterios**:
  - Soporte para diferentes navegadores
  - Diseño responsive
  - Textos legibles y contrastes adecuados

### RNF-006: Mantenibilidad

#### RNF-006.1: Código
- **Descripción**: El código debe ser mantenible
- **Criterios**:
  - Código bien documentado
  - Estándares de codificación consistentes
  - Tests unitarios y de integración
  - Arquitectura modular

#### RNF-006.2: Documentación
- **Descripción**: El sistema debe estar bien documentado
- **Criterios**:
  - Documentación técnica completa
  - Manual de usuario
  - Documentación de API
  - Guías de instalación y configuración

### RNF-007: Compatibilidad

#### RNF-007.1: Navegadores
- **Descripción**: El sistema debe funcionar en navegadores modernos
- **Criterios**:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

#### RNF-007.2: Dispositivos
- **Descripción**: El sistema debe ser responsive
- **Criterios**:
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667)

## 📊 Métricas de Calidad

### Métricas de Rendimiento
- Tiempo de respuesta promedio: < 1.5 segundos
- Throughput: 1000 requests/minuto
- Uso de memoria: < 512MB por instancia
- Uso de CPU: < 70% promedio

### Métricas de Seguridad
- Vulnerabilidades críticas: 0
- Vulnerabilidades altas: < 2
- Cobertura de tests: > 80%
- Tiempo de detección de intrusiones: < 5 minutos

### Métricas de Usabilidad
- Tiempo de aprendizaje: < 2 horas
- Tasa de error del usuario: < 5%
- Satisfacción del usuario: > 4.0/5.0
- Tiempo de completar tareas: < 5 minutos
