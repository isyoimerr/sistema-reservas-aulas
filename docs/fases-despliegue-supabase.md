# Fases para despliegue seguro y mantenible

## Estado actual del proyecto

La aplicación de reservas de aulas se encuentra en un estado funcional de desarrollo con arquitectura PHP + MySQL, enfocada en operación institucional de la institución. La autenticación, roles y acceso por permisos ya están definidos y el panel administrativo se encuentra en una etapa avanzada de mejora visual y responsiva.

En la versión actual se trabajó en lo siguiente:
- panel administrativo con mejor distribución visual
- sidebar lateral izquierdo con comportamiento desplegable
- layout tipo dashboard con contadores y métricas a la derecha
- ajustes responsivos para evitar compresión en pantallas móviles
- mantenimiento del flujo principal de navegación para autenticación y gestión

## Fase 1: auditoría y preparación
- Revisar la app actual como proyecto PHP + MySQL.
- Confirmar que la lógica de autenticación y permisos se centraliza en la carpeta config.
- Validar que las rutas principales estén claras por rol.
- Documentar la diferencia entre:
  - app web pública,
  - intranet autenticada,
  - panel administrativo.
- Registrar cada ajuste funcional y visual como parte de la memoria viva del proyecto.

## Fase 2: base de datos en Supabase
- Crear proyecto nuevo en Supabase.
- Importar el schema desde supabase/schema.sql.
- Verificar roles, usuarios, aulas, reservas y horarios.
- Definir políticas de seguridad si se reutiliza auth de Supabase.
- Crear usuarios de prueba y comprobar contraseñas y permisos.

## Fase 3: migración de conexión
- Sustituir la conexión MySQL por variables de entorno.
- Mantener una capa de acceso con Supabase client o PostgREST.
- Evitar secretos hardcodeados.
- Configurar .env.example como base para cada entorno.

## Fase 4: despliegue en Vercel
- Vercel solo sirve bien frontend o runtimes serverless.
- Este proyecto actual es PHP, así que no puede ir a Vercel tal cual.
- Para desplegarlo en Vercel, hay dos caminos:
  1. Migrar la aplicación a Next.js / Node para que funcione en Vercel.
  2. Mantener la app PHP en hosting compatible y usar Vercel solo para una front-end estático o un panel de consumo.
- Si se quiere Vercel como destino final, se recomienda migrar la parte web a un stack compatible con Vercel y usar Supabase como base de datos.

## Fase 5: estrategia de futuro
- Mantener un entorno por: desarrollo, staging y producción.
- Guardar secretos solo en Vercel env vars o Supabase secrets.
- Usar ramas por feature.
- Crear checklist de cada cambio:
  - migración de schema,
  - permisos,
  - rutas,
  - pruebas,
  - despliegue.
- Actualizar la memoria del proyecto cada vez que haya cambios relevantes.

## Fase 6: checklist antes de cada despliegue
- Confirmar que no hay rutas rotas.
- Confirmar que los permisos siguen funcionando.
- Confirmar que la base de datos tiene esquemas actualizados.
- Verificar variables de entorno.
- Comprobar que no hubo cambios de rol sin revisión.
- Ejecutar pruebas de login, acceso y reservas.
- Validar experiencia móvil en pantallas clave.

## Recomendación final
Para que esta app tenga futuro y sea mantenible, la decisión correcta es:
- dejar la base de datos en Supabase si se planifica una migración real,
- mover la capa web a un stack compatible con Vercel si se quiere hosting moderno,
- y mantener siempre la lógica centralizada para rutas y permisos.

Esto evita errores de despliegue, duplicación de infraestructura y cambios rotos en futuras iteraciones.

## Nota de mantenimiento
La documentación debe tratarse como un documento vivo y no como una versión estática. Cualquier cambio en UX, permisos, base de datos, rutas o despliegue debe quedar reflejado en la memoria del proyecto para conservar contexto institucional y técnico.
