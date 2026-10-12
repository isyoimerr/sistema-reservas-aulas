# Sistema de reservas de aulas - ITEJABB

Proyecto web en PHP con PDO y MySQL para la gestión de reservas, horarios, usuarios y aulas de la institución. La solución está pensada para uso interno en un entorno académico, con control de roles y panel administrativo.

## Estado actual del proyecto

El proyecto ya está funcionando como una aplicación PHP modular con autenticación por sesión y validación de permisos por rol. En la parte visual se avanzó en un rediseño más moderno y responsivo, especialmente en el panel administrativo.

### Cambios recientes documentados
- Ajuste del panel administrativo para que se vea de forma más ordenada y compacta en tablet y móvil.
- Sidebar principal a la izquierda, con comportamiento desplegable en pantallas pequeñas.
- Contenido principal y métricas visuales a la derecha, orientado a una visión tipo dashboard.
- Mejoras en espaciado, tamaños de fuentes y distribución de tarjetas para mejorar la experiencia móvil.
- Mantención del diseño de escritorio sin romper la navegación principal.

## Stack actual
- PHP 8.x
- MySQL / MariaDB
- Apache a través de XAMPP
- PDO para acceso a base de datos
- Bootstrap 5
- Bootstrap Icons
- JavaScript para interacciones del panel y controles responsivos
- Next.js 16 + React 19 para la migración Vercel
- Supabase PostgreSQL para persistencia y autenticación institucional

## Funcionalidades principales ya incorporadas
- Menú lateral izquierdo con opciones de navegación del sistema.
- Registro de usuarios docentes desde la interfaz.
- Inicio de sesión con validación por correo y contraseña.
- Búsqueda de reservas por aula, docente, motivo o estado.
- Registro de nuevas reservas desde el dashboard.
- Edición de reservas existentes desde la tabla.
- Validación de disponibilidad y estados de reserva.
- Dashboard administrativo con métricas rápidas.
- Persistencia real en Supabase cuando la configuración está activa.

## Roles y flujo principal
- Superadministrador: acceso completo a gestión, usuarios, aulas, reservas, horarios y reportes.
- Profesor: acceso a reservas y vista general de su actividad.
- Login centralizado en la carpeta login.
- Control de permisos centralizado en config/rbac.php.

## Estructura principal
- admin/: panel administrativo y gestión interna
- aulas/: administración de aulas
- reservas/: creación, consulta y validación de reservas
- horarios/: carga y procesamiento de horarios
- usuarios/: registro y perfil de docentes
- login/: autenticación y cierre de sesión
- config/: conexión, validaciones y RBAC
- css/: estilos globales del proyecto
- js/: interacciones del front-end
- database/: scripts SQL de base de datos
- supabase/: base de datos y esquema relacionado
- docs/: documentación técnica y de despliegue

## Buenas prácticas del proyecto
- Usar PDO con prepared statements.
- Validar sesión en todas las vistas que requieren autenticación.
- Mantener la lógica de permisos centralizada y consistente.
- No aplicar eliminación física sobre registros sensibles sin necesidad.
- Registrar cambios importantes en la memoria del proyecto.

## Recomendaciones actuales
1. Mantener la base de datos en MySQL local mientras se consolida la versión institucional.
2. Revisar la migración a Supabase o un entorno cloud solo cuando se defina el despliegue final.
3. Usar la memoria del proyecto como fuente de verdad para cambios funcionales y visuales.
4. Continuar validando la experiencia móvil antes de cada entrega importante.

## Memoria viva del proyecto
La memoria del proyecto se conserva en la carpeta /memories/repo/ y debe actualizarse cada vez que se haga una modificación relevante del sistema, UX o arquitectura. Esto ayuda a conservar contexto y evitar pérdidas de conocimiento entre cambios.

## Siguiente línea de trabajo
- revisar y consolidar la experiencia móvil en las demás pantallas del sistema
- normalizar la documentación por módulo
- validar flujo completo de reservas y permisos en entorno real
- preparar la migración o despliegue final según la estrategia institucional
