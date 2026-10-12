# Memoria del proyecto: Sistema de reservas de aulas

## 1. Visión general
Este proyecto es una aplicación web institucional para gestionar reservas de aulas, horarios, usuarios y permisos dentro de una institución educativa. Está orientado a uso interno, con acceso diferenciado por roles y control de flujo académico.

El sistema permite a docentes y administradores:
- registrar usuarios y perfiles
- consultar y crear reservas de aulas
- validar disponibilidad por horario
- administrar aulas y horarios institucionales
- revisar reportes y actividad del sistema
- controlar accesos según permisos de rol

## 2. Objetivo principal
Automatizar la administración de recursos académicos y evitar conflictos de uso entre docentes, coordinadores y personal administrativo, manteniendo un control claro de disponibilidad, horarios y permisos.

## 3. Estado actual
El proyecto se encuentra funcional en su núcleo como aplicación PHP modular con sesiones, validación de roles y base de datos relacional. La interfaz administrativa se ha reestructurado para mejorar la experiencia visual y la navegación en dispositivos móviles y tablets.

## 4. Stack tecnológico
- PHP 8.x
- MySQL / MariaDB
- PDO para acceso a base de datos
- Apache / XAMPP
- Bootstrap 5
- Bootstrap Icons
- JavaScript
- HTML + CSS
- Supabase como referencia o complemento para migración/infraestructura

## 5. Arquitectura y estructura

### Directorios principales
- admin/: gestión administrativa y control del sistema
- aulas/: administración de salones y disponibilidad
- reservas/: creación, consulta y validación de reservas
- horarios/: carga y procesamiento de horarios institucionales
- usuarios/: registro y perfil del docente
- login/: autenticación y cierre de sesión
- config/: conexión, validaciones y control RBAC
- database/: scripts SQL de creación y sembrado de datos
- supabase/: esquema y configuración relacionada con Supabase
- docs/: documentación técnica y de despliegue
- css/, js/, img/, includes/: recursos comunes y front-end

### Archivos clave
- config/conexion.php: conexión principal a la base de datos MySQL
- config/rbac.php: control de roles y permisos
- login/procesar.php: autenticación
- reservas/crear_reserva.php: creación de reservas
- reservas/validar_reserva.php: validación de disponibilidad
- admin/panel_admin.php: dashboard del administrador

## 6. Modelo de usuarios y roles
### Superadministrador
Tiene control total del sistema: usuarios, aulas, reservas, horarios, reportes y configuración.

### Profesor / docente
Puede registrar reservas, consultar disponibilidad, revisar su actividad y gestionar su perfil personal.

### Autenticación
La sesión y permisos se gestionan centralmente. Las pantallas sensibles validan sesión y rol antes de permitir acceso.

## 7. Flujo de negocio principal
1. El usuario ingresa en el sistema desde login.
2. El sistema valida credenciales y carga rol asociado.
3. El usuario accede al panel correspondiente.
4. Para crear una reserva, selecciona aula, horario y fecha.
5. El sistema valida disponibilidad.
6. Si la reserva es válida, se guarda.
7. El administrador puede gestionar el estado de la reserva y generar reportes.

## 8. Base de datos
La base de datos principal está definida en database/db_reservas_aulas.sql y se conecta desde config/conexion.php.

Configuración actual por defecto:
- host: localhost
- base de datos: db_reservas_aulas
- usuario: root
- contraseña: vacía

> Importante: esta configuración es local de desarrollo. Para producción debe cambiarse por credenciales seguras.

## 9. Objetivos funcionales ya cubiertos
- autenticación con sesión
- gestión de usuarios
- administración de aulas
- reservas con validación
- control por roles
- panel administrativo
- reportes básicos
- carga de horarios
- diseño más moderno y responsivo
- menú lateral automatizado con navegación institucional
- registro, búsqueda y edición de reservas desde la interfaz
- persistencia de usuarios y reservas en Supabase

## 10. Mejoras y pendientes
- consolidar la experiencia móvil en todas las pantallas restantes
- revisar la consistencia del flujo de reservas y permisos
- documentar mejor cada módulo por separado
- definir estrategia final de despliegue y migración
- validar la versión productiva con datos reales
- reforzar seguridad y validaciones antes del lanzamiento institucional

## 11. Observaciones de mantenimiento
- Mantener la lógica de permisos centralizada en config/rbac.php.
- Usar PDO con prepared statements en todas las consultas.
- Registrar cambios relevantes para conservar contexto de desarrollo.
- Usar la base de datos local mientras se consolida la versión institucional.

## 12. Recomendaciones para continuar
1. Mantener un backup de la base de datos local antes de cambios grandes.
2. Revisar ventanas de reserva y horarios con casos reales.
3. Validar accesos por rol con usuarios de prueba.
4. Preparar documentación final por módulo para entregar al personal institucional.
5. Cuando el proyecto esté listo para despliegue, decidir si se mantiene en MySQL local o se migra a Supabase/cloud.

## 13. Resumen corto
Es un sistema PHP institucional para la gestión de aulas, reservas y usuarios, pensado para una entidad educativa. Tiene una base sólida en autenticación, roles y panel administrativo, con una estructura modular y fácil de mantener.
