# Migración a Vercel + Supabase

Este proyecto es una versión segura y aislada del sistema original, preparada para migrar la lógica de reservas a un entorno moderno compatible con Vercel.

## Estado actual
- La aplicación original PHP + MySQL queda intacta.
- La migración se realiza en una carpeta separada: `migracion-vercel`.
- La estructura incluye rutas tipo `login`, `dashboard`, `admin` y `reservas`.
- La conexión real a Supabase está preparada con variables de entorno y un cliente seguro.

## Variables de entorno
Copia `.env.example` a `.env.local` y agrega tus credenciales reales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_APP_NAME="Sistema de Reservas"
```

## Fase 2: base de datos en Supabase
Se deja lista la preparación para esta fase con conexión real a Supabase:

- `supabase/schema.sql` contiene la base estructural del sistema.
- `lib/supabase.ts` valida la conexión real y bloquea la app si falta la configuración.
- El siguiente paso real es crear el proyecto en Supabase, importar el schema y verificar roles, usuarios y políticas RLS.

Checklist de validación recomendada:
1. Crear proyecto en Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Revisar tablas: `roles`, `usuarios`, `aulas`, `horarios`, `reservas`.
4. Crear cuentas de prueba para administrador y docente.
5. Validar permisos por rol.
6. Confirmar que no hay secretos hardcodeados y que `.env.local` no se sube al repositorio.

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Despliegue recomendado
- Vercel para la app web
- Supabase para la base de datos PostgreSQL
- migrar la lógica de auth y reservas desde la versión PHP original

## Importante
Esta versión está preparada para conectarse a Supabase con credenciales reales y no mantiene modo de desarrollo ni datos falsos en producción.
