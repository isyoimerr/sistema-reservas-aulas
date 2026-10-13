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
El proyecto se encuentra en una etapa de consolidación institucional: la base funcional original quedó estabilizada y, además, se desarrolló una versión migrada compatible con Vercel + Supabase para facilitar despliegue y operación moderna. El sistema mantiene la lógica académica del proyecto original, pero con una capa visual y de flujo más clara, responsiva y preparada para validación por parte de la institución.

### Estado actualizado tras la revisión de la migración
- La estructura de Next.js quedó preparada para desplegarse en Vercel con la carpeta raiz correcta: migracion-vercel.
- La conexión a Supabase quedó parametrizada con variables de entorno y cliente seguro.
- El esquema SQL preparado en supabase/schema.sql cubre usuarios, roles, aulas, horarios, reservas y auditoría básica.
- Se corrigió la lógica de carga y visualización de horarios para que no dependa de un solo día ni de un único docente, evitando errores graves de ETL y de filtrado visual.
- El flujo de docentes y aulas quedó más robusto al detectar conflictos, evitar duplicados y reutilizar registros cuando corresponda.
- La navegación y el diseño responsivo se ajustaron para mejorar la experiencia en navegador institucional y dispositivos móviles.
- Se dejó una base potencialmente lista para demostración técnica y presentación ante la institución, con una separación clara entre lógica demo y conexión real a Supabase.

### Verificación actual
- La revisión del editor no reporta errores de diagnóstico en la estructura del proyecto migrado.
- El estado de infraestructura es viable para producción si se validan el esquema SQL y las variables reales del entorno de Supabase/Vercel.
- La compilación completa del proyecto puede necesitar validación desde una terminal más estable, ya que en esta sesión el terminal de ejecución no respondió de forma consistente a comandos del entorno.

### Fase 2: Base de datos en Supabase (preparada)
- Se dejó la migración del proyecto en la carpeta `migracion-vercel` con un cliente de Supabase seguro y una validación de configuración por variables de entorno.
- El esquema base ya está en `supabase/schema.sql` y define usuarios, roles, aulas, horarios y reservas.
- La app mantiene un modo demo seguro para no romper el flujo si no existe Supabase configurado.
- La configuración ya contempla `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_DEMO_MODE`.
- La siguiente acción real en producción es conectar el proyecto con un proyecto real de Supabase y revisar políticas RLS y usuarios de prueba.

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
- mejorar la trazabilidad de auditoría para cambios de estado de reservas y horarios
- preparar una capa de autenticación real con Supabase Auth si la institución exige login institucional robusto
- definir un modelo de datos más completo para asignaturas, jornadas, semestres y dependencias académicas
- revisar los permisos a nivel de acción y no solo de rol para un entorno académico más estricto

## 11. Diagnóstico de diseño y backend para presentación institucional

### Diagnóstico de diseño
El proyecto ya ha superado la etapa de “funcionalidad básica” y avanza hacia una propuesta institucional con buena claridad visual. Sin embargo, para presentar ante la institución aún falta reforzar la percepción de calidad y madurez en tres ámbitos:

1. Consistencia visual institucional
   - Ajustar la identidad visual para que se sienta más “institucional”, con una guía visual clara de marca, colores, tipografías y jerarquía de contenido.
   - Unificar estilos entre login, dashboard, reportes, reservas y gestión de horarios para que todo se vea como un mismo sistema.
   - Reforzar el uso de espacios, botones, estados y alertas coherentes para evitar que las pantallas parezcan módulos independientes.

2. Experiencia de usuario sobre datos académicos
   - La información de horarios, aulas y reservas debe ser más legible con filtros claros por docente, aula, día y rango horario.
   - En pantallas administrativas, conviene mostrar indicadores de ocupación, conflictos y estados rápidos de cada aula.
   - Las tablas deben ayudar a la toma de decisiones; no solo registrar información, sino interpretarla visualmente.

3. Responsividad de uso real
   - La app ya se adapta a dispositivos móviles, pero en un entorno académico la validación debe hacerse con tabletas, laptops y pantallas de proyección.
   - Revisar cada flujo crítico en tamaños de pantalla pequeños para no depender de hover ni de acciones poco intuitivas.

### Diagnóstico de backend
El backend tiene una base sólida, pero para una presentación institucional aún conviene reforzar la capa operativa y de seguridad:

1. Revisión del modelo de datos
   - Incorporar entidad de asignaturas, semestres, periodos académicos y jornadas para hacer el sistema más cercano al entorno real de la universidad.
   - Alinear cada tabla con un nomenclátor claro y evitar nombres ambiguos entre UI, datos y lógica de negocio.

2. Validación de negocio más estricta
   - Controlar no solo solapamiento de horario, sino también conflicto por docente, por aula y por disponibilidad real en un calendario académico.
   - Definir reglas para reservas recurrentes, excepción de feriados, clases prácticas y laboratorios.

3. Seguridad y trazabilidad
   - Añadir bitácoras más detalladas para cada acción sobre aulas, horarios, usuarios y reservas.
   - Registrar quién aprobó, rechazó, editó o eliminó un registro y por qué.
   - Establecer roles más finos para evitar que un mismo rol pueda manipular datos fuera de su alcance.

4. Integración con Supabase y despliegue
   - Se recomienda dejar la base de datos con políticas de acceso bien definidas y un flujo real de producción.
   - Validar la conexión con datos reales del entorno institucional para confirmar que las consultas, inserciones y actualizaciones se comportan igual que en local.
   - Preparar un entorno de pruebas y un entorno de producción claramente separados.

### Recomendación de evolución prioritaria
Para presentar el proyecto a la institución, la mejor estrategia es priorizar una “fase de madurez institucional” sobre una “fase de más funciones”. Es decir:
- perfeccionar la experiencia visual,
- reforzar reglas de negocio académicas,
- mejorar la trazabilidad y la seguridad,
- dejar la base de datos y despliegue realmente operativos.

Eso hará que el sistema no solo “funcione”, sino que parezca un producto serio, documentado y listo para ser evaluado por decisión institucional.

## 12. Observaciones de mantenimiento
- Mantener la lógica de permisos centralizada en config/rbac.php.
- Usar PDO con prepared statements en todas las consultas.
- Registrar cambios relevantes para conservar contexto de desarrollo.
- Usar la base de datos local mientras se consolida la versión institucional.
- Mantener una estrategia clara entre entorno demo, pruebas y producción.

## 13. Recomendaciones para continuar
1. Mantener un backup de la base de datos local antes de cambios grandes.
2. Revisar ventanas de reserva y horarios con casos reales.
3. Validar accesos por rol con usuarios de prueba.
4. Preparar documentación final por módulo para entregar al personal institucional.
5. Cuando el proyecto esté listo para despliegue, decidir si se mantiene en MySQL local o se migra a Supabase/cloud.
6. Definir claramente la estrategia de producción institucional antes de la presentación final.
7. Incluir un manual de operación para administración, docencia y coordinación académica.

## 14. Resumen corto
Es un sistema PHP institucional para la gestión de aulas, reservas y usuarios, pensado para una entidad educativa. Tiene una base sólida en autenticación, roles y panel administrativo, con una estructura modular y fácil de mantener. La versión migrada a Vercel/Supabase refuerza la base técnica, la mejora visual y la posibilidad de despliegue, aunque aún requiere una validación institucional más fuerte en diseño, seguridad y reglas académicas para llegar a una versión de presentación final sólida.

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
