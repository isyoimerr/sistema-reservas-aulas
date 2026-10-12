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
NEXT_PUBLIC_DEMO_MODE=true
```

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
Esta versión funciona en modo demo y no altera el proyecto original. Una vez se entreguen las credenciales reales de Supabase, el frontend puede conectarse a la base de datos sin tocar el resto de la estructura.
