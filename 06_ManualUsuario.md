# 06. Manual del Usuario Final

## 📖 Introducción

Este manual está diseñado para guiar a los usuarios finales del sistema **BackendIntranet** a través de todas las funcionalidades disponibles. El sistema está organizado por roles de usuario, cada uno con permisos y funcionalidades específicas.

## 👥 Roles de Usuario

### Administrador
- **Descripción**: Control total del sistema
- **Permisos**: Gestión de usuarios, configuración del sistema, supervisión general
- **Acceso**: Todos los módulos y funcionalidades

### Asesor Académico
- **Descripción**: Profesional que brinda asesorías
- **Permisos**: Gestión de asesorías asignadas, calendario, recursos
- **Acceso**: Módulos de asesoría, reuniones, recursos

### Cliente/Estudiante
- **Descripción**: Usuario que solicita servicios de asesoría
- **Permisos**: Solicitar asesorías, ver progreso, acceder a recursos
- **Acceso**: Módulos de asesoría, calendario, recursos

### Supervisor
- **Descripción**: Supervisa asesores y áreas específicas
- **Permisos**: Supervisión de asesores, reportes de área
- **Acceso**: Módulos de supervisión, reportes

### Personal de Soporte
- **Descripción**: Resuelve problemas técnicos
- **Permisos**: Gestión de tickets, soporte técnico
- **Acceso**: Módulo de soporte, herramientas de diagnóstico

## 🔐 Autenticación y Acceso

### Inicio de Sesión

1. **Acceder al Sistema**
   - Abrir navegador web
   - Ir a la URL del sistema: `http://tu-servidor:3000`
   - Hacer clic en "Iniciar Sesión"

2. **Credenciales de Acceso**
   - **Usuario**: Tu nombre de usuario o email
   - **Contraseña**: Tu contraseña asignada
   - Hacer clic en "Entrar"

3. **Primer Acceso**
   - El sistema te pedirá cambiar la contraseña
   - Seguir las instrucciones en pantalla
   - Usar una contraseña segura

### Recuperación de Contraseña

1. **Solicitar Recuperación**
   - En la pantalla de login, hacer clic en "¿Olvidaste tu contraseña?"
   - Ingresar tu email registrado
   - Hacer clic en "Enviar"

2. **Verificar Email**
   - Revisar tu bandeja de entrada
   - Buscar email del sistema
   - Hacer clic en el enlace de recuperación

3. **Nueva Contraseña**
   - Ingresar nueva contraseña
   - Confirmar nueva contraseña
   - Hacer clic en "Cambiar Contraseña"

## 🏠 Panel Principal

### Dashboard por Rol

#### Administrador
- **Resumen General**: Estadísticas del sistema
- **Usuarios Activos**: Lista de usuarios conectados
- **Asesorías Pendientes**: Solicitudes sin asignar
- **Reportes Rápidos**: Métricas principales

#### Asesor
- **Mis Asesorías**: Asesorías asignadas
- **Calendario**: Reuniones programadas
- **Tareas Pendientes**: Acciones requeridas
- **Recursos Recientes**: Últimos recursos agregados

#### Cliente/Estudiante
- **Mis Solicitudes**: Estado de asesorías solicitadas
- **Próximas Reuniones**: Citas programadas
- **Recursos Disponibles**: Materiales de estudio
- **Progreso**: Avance en asesorías

## 👤 Gestión de Usuarios

### Perfil de Usuario

#### Ver Perfil
1. Hacer clic en tu nombre en la esquina superior derecha
2. Seleccionar "Mi Perfil"
3. Revisar información personal

#### Editar Perfil
1. En "Mi Perfil", hacer clic en "Editar"
2. Modificar información necesaria
3. Hacer clic en "Guardar Cambios"

#### Cambiar Contraseña
1. En "Mi Perfil", hacer clic en "Cambiar Contraseña"
2. Ingresar contraseña actual
3. Ingresar nueva contraseña
4. Confirmar nueva contraseña
5. Hacer clic en "Actualizar"

### Gestión de Usuarios (Solo Administradores)

#### Crear Usuario
1. Ir a "Usuarios" en el menú principal
2. Hacer clic en "Nuevo Usuario"
3. Completar formulario:
   - Nombre de usuario
   - Email
   - Contraseña temporal
   - Rol del usuario
4. Hacer clic en "Crear Usuario"

#### Editar Usuario
1. En la lista de usuarios, hacer clic en el usuario
2. Hacer clic en "Editar"
3. Modificar información necesaria
4. Hacer clic en "Guardar"

#### Desactivar Usuario
1. En la lista de usuarios, hacer clic en el usuario
2. Hacer clic en "Desactivar"
3. Confirmar la acción

## 🎓 Gestión de Asesorías

### Solicitar Asesoría (Clientes)

#### Crear Solicitud
1. Ir a "Asesorías" en el menú principal
2. Hacer clic en "Nueva Solicitud"
3. Completar formulario:
   - Título de la asesoría
   - Descripción detallada
   - Área de estudio
   - Fecha preferida de inicio
4. Hacer clic en "Enviar Solicitud"

#### Ver Estado de Solicitudes
1. En "Asesorías", ver lista de solicitudes
2. Cada solicitud muestra:
   - Estado actual
   - Asesor asignado (si aplica)
   - Fecha de creación
   - Progreso

### Gestionar Asesorías (Asesores)

#### Ver Asesorías Asignadas
1. Ir a "Mis Asesorías"
2. Ver lista de asesorías asignadas
3. Hacer clic en una asesoría para ver detalles

#### Actualizar Estado
1. En los detalles de la asesoría
2. Hacer clic en "Actualizar Estado"
3. Seleccionar nuevo estado:
   - En Progreso
   - Pausada
   - Completada
   - Cancelada
4. Agregar comentarios si es necesario
5. Hacer clic en "Guardar"

#### Programar Reunión
1. En los detalles de la asesoría
2. Hacer clic en "Programar Reunión"
3. Seleccionar fecha y hora
4. Agregar descripción de la reunión
5. Hacer clic en "Programar"

## 📅 Gestión de Reuniones

### Ver Calendario

#### Calendario Personal
1. Ir a "Calendario" en el menú principal
2. Ver reuniones del mes actual
3. Usar navegación para cambiar mes/semana

#### Programar Nueva Reunión
1. En el calendario, hacer clic en una fecha
2. Seleccionar "Nueva Reunión"
3. Completar formulario:
   - Título de la reunión
   - Participantes
   - Hora de inicio y fin
   - Descripción
4. Hacer clic en "Programar"

### Gestionar Reuniones

#### Editar Reunión
1. Hacer clic en una reunión en el calendario
2. Seleccionar "Editar"
3. Modificar información necesaria
4. Hacer clic en "Guardar"

#### Cancelar Reunión
1. Hacer clic en una reunión en el calendario
2. Seleccionar "Cancelar"
3. Agregar motivo de cancelación
4. Hacer clic en "Confirmar"

## 📄 Gestión de Contratos

### Crear Contrato (Asesores/Administradores)

#### Generar Contrato
1. Ir a "Contratos" en el menú principal
2. Hacer clic en "Nuevo Contrato"
3. Seleccionar asesoría relacionada
4. Completar información:
   - Título del contrato
   - Descripción de servicios
   - Monto acordado
   - Fecha de inicio y fin
5. Cargar documentos adjuntos si es necesario
6. Hacer clic en "Generar Contrato"

#### Ver Contratos
1. En "Contratos", ver lista de contratos
2. Hacer clic en un contrato para ver detalles
3. Ver documentos adjuntos
4. Descargar PDF del contrato

### Gestionar Pagos

#### Registrar Pago
1. Ir a "Pagos" en el menú principal
2. Hacer clic en "Nuevo Pago"
3. Seleccionar contrato relacionado
4. Completar información:
   - Monto del pago
   - Método de pago
   - Fecha del pago
   - Referencia de transacción
5. Hacer clic en "Registrar Pago"

#### Ver Historial de Pagos
1. En "Pagos", ver lista de pagos
2. Filtrar por fecha, contrato o estado
3. Exportar reporte si es necesario

## 📚 Recursos Educativos

### Acceder a Recursos

#### Navegar Recursos
1. Ir a "Recursos" en el menú principal
2. Seleccionar tipo de recurso:
   - Guías de Estudio
   - Tutoriales
   - Herramientas
   - Noticias
   - Soluciones

#### Buscar Recursos
1. Usar barra de búsqueda en la parte superior
2. Filtrar por categoría o etiquetas
3. Ordenar por fecha o relevancia

### Gestionar Recursos (Asesores/Administradores)

#### Crear Recurso
1. En "Recursos", hacer clic en "Nuevo Recurso"
2. Seleccionar tipo de recurso
3. Completar formulario:
   - Título
   - Descripción
   - Categoría
   - Etiquetas
4. Cargar archivo si es necesario
5. Hacer clic en "Crear"

#### Editar Recurso
1. Hacer clic en un recurso existente
2. Seleccionar "Editar"
3. Modificar información necesaria
4. Hacer clic en "Guardar"

## 🎫 Sistema de Soporte

### Crear Ticket de Soporte

#### Reportar Problema
1. Ir a "Soporte" en el menú principal
2. Hacer clic en "Nuevo Ticket"
3. Completar formulario:
   - Título del problema
   - Descripción detallada
   - Categoría del problema
   - Prioridad
4. Adjuntar capturas de pantalla si es necesario
5. Hacer clic en "Enviar Ticket"

#### Ver Mis Tickets
1. En "Soporte", ver lista de tickets
2. Hacer clic en un ticket para ver detalles
3. Ver respuestas del personal de soporte
4. Agregar comentarios adicionales si es necesario

### Gestionar Tickets (Personal de Soporte)

#### Ver Tickets Asignados
1. Ir a "Soporte" en el menú principal
2. Ver lista de tickets asignados
3. Filtrar por estado o prioridad

#### Responder Ticket
1. Hacer clic en un ticket
2. Leer descripción del problema
3. Escribir respuesta en el campo de comentarios
4. Cambiar estado si es necesario
5. Hacer clic en "Enviar Respuesta"

## 🔔 Notificaciones

### Ver Notificaciones

#### Panel de Notificaciones
1. Hacer clic en el ícono de campana en la parte superior
2. Ver lista de notificaciones recientes
3. Hacer clic en una notificación para ver detalles

#### Marcar como Leída
1. Hacer clic en una notificación
2. Se marca automáticamente como leída
3. O hacer clic en "Marcar todas como leídas"

### Configurar Notificaciones

#### Preferencias de Notificación
1. Ir a "Configuración" en tu perfil
2. Seleccionar "Notificaciones"
3. Configurar tipos de notificaciones:
   - Email
   - Notificaciones en pantalla
   - Notificaciones push (si está disponible)
4. Hacer clic en "Guardar"

## 📊 Reportes y Estadísticas

### Ver Reportes (Administradores/Supervisores)

#### Reportes Disponibles
1. Ir a "Reportes" en el menú principal
2. Seleccionar tipo de reporte:
   - Usuarios activos
   - Asesorías por período
   - Pagos procesados
   - Rendimiento de asesores

#### Generar Reporte
1. Seleccionar período de tiempo
2. Aplicar filtros necesarios
3. Hacer clic en "Generar Reporte"
4. Descargar en formato PDF o Excel

### Exportar Datos

#### Exportar Información
1. En cualquier lista de datos
2. Hacer clic en "Exportar"
3. Seleccionar formato:
   - Excel (.xlsx)
   - CSV (.csv)
   - PDF (.pdf)
4. Hacer clic en "Descargar"

## ⚠️ Solución de Problemas Comunes

### Problemas de Acceso

#### No puedo iniciar sesión
1. Verificar que el usuario y contraseña sean correctos
2. Verificar que la cuenta esté activa
3. Intentar recuperar contraseña
4. Contactar al administrador del sistema

#### Error de permisos
1. Verificar que tu rol tenga los permisos necesarios
2. Contactar al administrador para verificar permisos
3. Cerrar sesión y volver a iniciar

### Problemas de Funcionalidad

#### La página no carga
1. Verificar conexión a internet
2. Actualizar la página (F5)
3. Limpiar caché del navegador
4. Intentar en otro navegador

#### Los archivos no se cargan
1. Verificar que el archivo no exceda el tamaño límite
2. Verificar que el formato del archivo sea compatible
3. Intentar con un archivo diferente
4. Contactar al soporte técnico

#### Los datos no se guardan
1. Verificar que todos los campos requeridos estén completos
2. Verificar conexión a internet
3. Intentar guardar nuevamente
4. Contactar al soporte si el problema persiste

## 📞 Contacto y Soporte

### Canales de Soporte

#### Soporte Técnico
- **Email**: soporte@empresa.com
- **Teléfono**: +1 (555) 123-4567
- **Horario**: Lunes a Viernes, 9:00 AM - 6:00 PM

#### Soporte por Ticket
- Crear ticket en el sistema
- Respuesta en 24 horas hábiles
- Seguimiento del estado en tiempo real

### Recursos Adicionales

#### Documentación
- Manual de usuario completo
- Preguntas frecuentes (FAQ)
- Videos tutoriales
- Guías paso a paso

#### Capacitación
- Sesiones de capacitación programadas
- Materiales de entrenamiento
- Soporte personalizado para nuevos usuarios

## 🔄 Actualizaciones del Sistema

### Notificaciones de Actualización

#### Recibir Notificaciones
- El sistema notifica sobre actualizaciones importantes
- Revisar notificaciones regularmente
- Leer notas de versión para conocer cambios

#### Nuevas Funcionalidades
- Las nuevas funcionalidades se anuncian en el dashboard
- Consultar documentación actualizada
- Participar en sesiones de capacitación

### Mantenimiento Programado

#### Horarios de Mantenimiento
- Sábados de 2:00 AM - 4:00 AM
- Notificación con 48 horas de anticipación
- Acceso limitado durante el mantenimiento

#### Planificación de Uso
- Evitar tareas críticas durante horarios de mantenimiento
- Guardar trabajo antes de los períodos de mantenimiento
- Contactar soporte si hay urgencias
