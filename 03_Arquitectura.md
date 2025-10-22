# 03. Arquitectura del Sistema

## 🏗️ Visión General de la Arquitectura

El **BackendIntranet** está construido siguiendo una arquitectura de microservicios modular basada en NestJS, que proporciona una base sólida y escalable para la gestión de servicios de asesoría académica.

## 🎯 Principios Arquitectónicos

### 1. Modularidad
- **Separación de Responsabilidades**: Cada módulo tiene una responsabilidad específica
- **Acoplamiento Bajo**: Los módulos son independientes entre sí
- **Cohesión Alta**: Funcionalidades relacionadas están agrupadas

### 2. Escalabilidad
- **Horizontal**: Fácil adición de nuevas instancias
- **Vertical**: Optimización de recursos por instancia
- **Modular**: Escalado independiente por funcionalidad

### 3. Mantenibilidad
- **Código Limpio**: Estándares de codificación consistentes
- **Documentación**: Código autodocumentado
- **Testing**: Cobertura de pruebas integral

## 🏛️ Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Web App   │  │  Mobile App │  │  Admin Panel│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                    API GATEWAY                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Auth      │  │  Rate Limit │  │  Validation │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                   LÓGICA DE NEGOCIO                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Controllers │  │  Services   │  │   Guards    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                   ACCESO A DATOS                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  TypeORM    │  │  Repositories│  │   Entities  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                    PERSISTENCIA                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   MySQL     │  │  Backblaze  │  │   Redis     │     │
│  │  Database   │  │     B2      │  │   Cache     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 🧩 Módulos del Sistema

### Módulos de Autenticación y Usuarios

#### AuthModule
- **Responsabilidad**: Autenticación y autorización
- **Componentes**:
  - `AuthController`: Endpoints de login, recuperación de contraseña
  - `AuthService`: Lógica de autenticación
  - `JwtStrategy`: Estrategia JWT para Passport
  - `JwtAuthGuard`: Guard para proteger rutas

#### UsuarioModule
- **Responsabilidad**: Gestión de usuarios base
- **Componentes**:
  - `UsuarioEntity`: Entidad de usuario
  - `UsuarioController`: CRUD de usuarios
  - `UsuarioService`: Lógica de negocio

#### RolModule
- **Responsabilidad**: Gestión de roles y permisos
- **Componentes**:
  - `RolEntity`: Entidad de rol
  - `RolController`: CRUD de roles
  - `RolService`: Lógica de roles

### Módulos de Negocio

#### AsesoramientoModule
- **Responsabilidad**: Gestión de procesos de asesoría
- **Componentes**:
  - `AsesoramientoEntity`: Entidad de asesoramiento
  - `AsesoramientoController`: Endpoints de asesoría
  - `AsesoramientoService`: Lógica de asesorías

#### ClienteModule
- **Responsabilidad**: Gestión de clientes/estudiantes
- **Componentes**:
  - `ClienteEntity`: Entidad de cliente
  - `ClienteController`: CRUD de clientes
  - `ClienteService`: Lógica de clientes

#### AsesorModule
- **Responsabilidad**: Gestión de asesores
- **Componentes**:
  - `AsesorEntity`: Entidad de asesor
  - `AsesorController`: CRUD de asesores
  - `AsesorService`: Lógica de asesores

#### ContratoModule
- **Responsabilidad**: Gestión de contratos
- **Componentes**:
  - `ContratoEntity`: Entidad de contrato
  - `ContratoController`: Endpoints de contratos
  - `ContratoService`: Lógica de contratos

#### PagosModule
- **Responsabilidad**: Gestión de pagos
- **Componentes**:
  - `PagoEntity`: Entidad de pago
  - `InformacionPagosEntity`: Información de pagos
  - `PagosController`: Endpoints de pagos
  - `PagosService`: Lógica de pagos

### Módulos de Soporte

#### RecursosModule
- **Responsabilidad**: Gestión de recursos educativos
- **Submódulos**:
  - `GuiaController`: Guías de estudio
  - `TutorialController`: Tutoriales
  - `HerramientaController`: Herramientas
  - `NoticiaController`: Noticias
  - `SolucionController`: Soluciones

#### ReunionesModule
- **Responsabilidad**: Gestión de reuniones y calendario
- **Componentes**:
  - `ReunionEntity`: Entidad de reunión
  - `ReunionesController`: Endpoints de reuniones
  - `ReunionesService`: Lógica de reuniones

#### SoportesModule
- **Responsabilidad**: Sistema de tickets de soporte
- **Componentes**:
  - `SoporteEntity`: Entidad de soporte
  - `SoportesController`: Endpoints de soporte
  - `SoportesService`: Lógica de soporte

#### NotificacionesModule
- **Responsabilidad**: Sistema de notificaciones
- **Componentes**:
  - `NotificacionEntity`: Entidad de notificación
  - `NotificacionController`: Endpoints de notificaciones
  - `NotificacionService`: Lógica de notificaciones

### Módulos de Infraestructura

#### MailModule
- **Responsabilidad**: Servicios de email
- **Componentes**:
  - `MailService`: Envío de emails
  - Templates de email (Handlebars)

#### BackblazeModule
- **Responsabilidad**: Almacenamiento de archivos
- **Componentes**:
  - `BackblazeService`: Gestión de archivos en B2
  - `BackblazeController`: Endpoints de archivos

#### CommonModule
- **Responsabilidad**: Funcionalidades comunes
- **Componentes**:
  - `CommonService`: Servicios compartidos
  - `CommonController`: Endpoints comunes
  - Entidades comunes (GradoAcademico, TipoContrato, etc.)

## 🗄️ Arquitectura de Base de Datos

### Patrón de Diseño
- **ORM**: TypeORM para mapeo objeto-relacional
- **Patrón Repository**: Abstracción de acceso a datos
- **Migrations**: Control de versiones de esquema

### Entidades Principales

#### Jerarquía de Usuarios
```
Usuario (Base)
├── Admin
├── Asesor
├── Cliente
└── Supervisor
```

#### Relaciones Clave
- **Usuario ↔ Rol**: Many-to-One
- **Cliente ↔ Asesoramiento**: Many-to-Many
- **Asesoramiento ↔ Contrato**: One-to-One
- **Contrato ↔ Pago**: One-to-Many
- **Usuario ↔ Reunion**: Many-to-Many

### Estrategias de Consulta
- **Lazy Loading**: Carga diferida de relaciones
- **Eager Loading**: Carga anticipada cuando es necesario
- **Query Builder**: Consultas complejas optimizadas

## 🔌 Arquitectura de APIs

### Patrón REST
- **Recursos**: Cada entidad es un recurso
- **Verbos HTTP**: GET, POST, PUT, PATCH, DELETE
- **Códigos de Estado**: Uso estándar de códigos HTTP
- **Versionado**: Preparado para versionado de API

### Estructura de Endpoints
```
/api/v1/
├── auth/           # Autenticación
├── usuarios/       # Gestión de usuarios
├── asesoramiento/  # Procesos de asesoría
├── contratos/      # Gestión de contratos
├── pagos/          # Sistema de pagos
├── recursos/       # Recursos educativos
├── reuniones/      # Calendario y reuniones
├── soporte/        # Sistema de tickets
└── notificaciones/ # Notificaciones
```

### Middleware y Guards
- **CORS**: Configuración de CORS
- **Rate Limiting**: Control de velocidad de peticiones
- **Validation**: Validación de DTOs
- **Authentication**: Verificación de tokens JWT
- **Authorization**: Control de acceso por roles

## 🐳 Arquitectura de Contenedores

### Docker Compose
```yaml
services:
  backend:     # Aplicación NestJS
  mysqldb:     # Base de datos MySQL
```

### Configuración de Red
- **Bridge Network**: Comunicación entre contenedores
- **Port Mapping**: Exposición de puertos necesarios
- **Volume Mounting**: Persistencia de datos

## 🔄 Flujo de Datos

### Flujo de Autenticación
1. Usuario envía credenciales
2. AuthService valida credenciales
3. Se genera token JWT
4. Token se envía al cliente
5. Cliente incluye token en peticiones

### Flujo de Procesamiento de Asesoría
1. Cliente crea solicitud de asesoría
2. Admin asigna asesor
3. Se crea proceso de asesoría
4. Se programan reuniones
5. Se genera contrato
6. Se procesan pagos
7. Se completa asesoría

## 📊 Patrones de Diseño Implementados

### 1. Repository Pattern
- Abstracción de acceso a datos
- Facilita testing y mantenimiento

### 2. Service Layer Pattern
- Separación de lógica de negocio
- Reutilización de código

### 3. Dependency Injection
- Inversión de control
- Facilita testing unitario

### 4. Decorator Pattern
- Validación de datos
- Autenticación y autorización

### 5. Strategy Pattern
- Diferentes estrategias de autenticación
- Múltiples proveedores de almacenamiento

## 🚀 Consideraciones de Escalabilidad

### Escalabilidad Horizontal
- **Load Balancer**: Distribución de carga
- **Stateless Design**: Sin estado en la aplicación
- **Database Sharding**: Particionado de datos

### Escalabilidad Vertical
- **Caching**: Redis para cache
- **Database Optimization**: Índices optimizados
- **Resource Monitoring**: Monitoreo de recursos

### Escalabilidad de Datos
- **File Storage**: Backblaze B2 para archivos
- **Database Indexing**: Índices estratégicos
- **Query Optimization**: Consultas optimizadas

## 🔒 Consideraciones de Seguridad

### Autenticación
- **JWT Tokens**: Tokens seguros con expiración
- **Password Hashing**: Bcrypt para contraseñas
- **Rate Limiting**: Protección contra ataques

### Autorización
- **RBAC**: Control de acceso basado en roles
- **Guards**: Protección de endpoints
- **Validation**: Validación de entrada

### Protección de Datos
- **HTTPS**: Comunicación encriptada
- **Input Validation**: Sanitización de entrada
- **Audit Logging**: Registro de actividades
