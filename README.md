# BackendIntranet - Sistema de Gestión de Asesorías Académicas

## 📋 Índice de Documentación

Este proyecto incluye documentación técnica completa organizada en los siguientes documentos:

- [01_Introduccion.md](./01_Introduccion.md) - Introducción y visión general del sistema
- [02_Requerimientos.md](./02_Requerimientos.md) - Especificación de requerimientos funcionales y no funcionales
- [03_Arquitectura.md](./03_Arquitectura.md) - Arquitectura del sistema y tecnologías utilizadas
- [04_DiseñoTecnico.md](./04_DiseñoTecnico.md) - Diseño técnico detallado y diagramas
- [05_ManualInstalacion.md](./05_ManualInstalacion.md) - Guía de instalación y despliegue
- [06_ManualUsuario.md](./06_ManualUsuario.md) - Manual del usuario final
- [07_Mantenimiento.md](./07_Mantenimiento.md) - Guía de mantenimiento y actualización
- [08_HistorialVersiones.md](./08_HistorialVersiones.md) - Historial de versiones y cambios

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Docker y Docker Compose
- MySQL 8.0+

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd BackendIntranet

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar con Docker
npm run up
```

### Acceso
- API: http://localhost:3000
- Base de datos: localhost:3306

## 🏗️ Arquitectura

Sistema backend desarrollado con:
- **Framework**: NestJS
- **Base de datos**: MySQL con TypeORM
- **Autenticación**: JWT
- **Contenedores**: Docker
- **Almacenamiento**: Backblaze B2

## 📚 Módulos Principales

- **Autenticación**: Login, recuperación de contraseña
- **Usuarios**: Gestión de roles (Admin, Asesor, Cliente, etc.)
- **Asesorías**: Procesos de asesoramiento académico
- **Contratos**: Gestión de contratos y documentos
- **Pagos**: Sistema de pagos y facturación
- **Recursos**: Guías, tutoriales, herramientas
- **Reuniones**: Calendario y gestión de citas
- **Soporte**: Sistema de tickets y soporte técnico

## 🔧 Scripts Disponibles

```bash
npm run start:dev    # Desarrollo
npm run build        # Compilar
npm run start:prod   # Producción
npm run test         # Pruebas
npm run migration:run # Ejecutar migraciones
```

## 📖 Documentación Completa

Para información detallada sobre instalación, configuración, uso y mantenimiento, consulte los documentos específicos en la carpeta de documentación.

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia UNLICENSED - ver el archivo [LICENSE](LICENSE) para detalles.