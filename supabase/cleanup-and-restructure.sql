-- Limpieza y reestructuración de datos para Supabase
-- Ejecutar desde el SQL editor de Supabase con permisos de administrador.
-- No es destructivo sobre los datos de negocio válidos; normaliza y elimina duplicados.

BEGIN;

-- 1) Normalizar roles existentes para que solo queden los valores del sistema.
UPDATE public.roles
SET nombre_rol = 'Superadministrador'
WHERE lower(trim(nombre_rol)) IN ('superadministrador', 'administrador', 'admin');

UPDATE public.roles
SET nombre_rol = 'Profesor'
WHERE lower(trim(nombre_rol)) IN ('profesor', 'docente', 'teacher');

-- 2) Eliminar roles duplicados por nombre normalizado.
WITH duplicados AS (
    SELECT id_rol,
           ROW_NUMBER() OVER (
               PARTITION BY lower(trim(nombre_rol))
               ORDER BY id_rol
           ) AS rn
    FROM public.roles
)
DELETE FROM public.roles
WHERE id_rol IN (
    SELECT id_rol FROM duplicados WHERE rn > 1
);

-- 3) Normalizar correos y dejar un único usuario por email.
UPDATE public.usuarios
SET email = lower(trim(email))
WHERE email IS NOT NULL;

WITH duplicados AS (
    SELECT id_usuario,
           ROW_NUMBER() OVER (
               PARTITION BY lower(trim(email))
               ORDER BY id_usuario
           ) AS rn
    FROM public.usuarios
)
DELETE FROM public.usuarios
WHERE id_usuario IN (
    SELECT id_usuario FROM duplicados WHERE rn > 1
);

-- 4) Completar columnas faltantes para la app.
ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS cargo VARCHAR(100),
    ADD COLUMN IF NOT EXISTS area VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cc VARCHAR(50),
    ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT 'img/default-avatar.svg';

-- 5) Limpiar nombres nulos, vacíos o con espacios.
UPDATE public.usuarios
SET nombre = trim(nombre),
    apellido = trim(apellido),
    email = lower(trim(email))
WHERE nombre IS NULL OR apellido IS NULL OR email IS NULL;

DELETE FROM public.usuarios
WHERE trim(nombre) = '' OR trim(apellido) = '' OR trim(email) = '';

-- 6) Asegurar que exista el admin base.
INSERT INTO public.roles (id_rol, nombre_rol)
VALUES (1, 'Superadministrador')
ON CONFLICT (id_rol) DO NOTHING;

INSERT INTO public.roles (id_rol, nombre_rol)
VALUES (2, 'Profesor')
ON CONFLICT (id_rol) DO NOTHING;

INSERT INTO public.usuarios (nombre, apellido, email, password, id_rol, estado, cargo, area, cc, avatar)
SELECT 'Admin', 'Sistema', 'admin@sistema.com', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 1, 'Activo', NULL, NULL, NULL, 'img/default-avatar.svg'
WHERE NOT EXISTS (
    SELECT 1 FROM public.usuarios WHERE lower(trim(email)) = 'admin@sistema.com'
)
ON CONFLICT (email) DO NOTHING;

-- 7) Limpiar reservas rotas o con aula/usuario inexistente.
DELETE FROM public.reservas r
WHERE NOT EXISTS (
    SELECT 1 FROM public.usuarios u WHERE u.id_usuario = r.id_usuario
)
   OR NOT EXISTS (
    SELECT 1 FROM public.aulas a WHERE a.id_aula = r.id_aula
);

-- 8) Limpiar historial huérfano.
DELETE FROM public.historial_reservas h
WHERE NOT EXISTS (
    SELECT 1 FROM public.reservas r WHERE r.id_reserva = h.id_reserva
);

-- 9) Reforzar consistencia de las tablas principales.
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_unique
ON public.usuarios (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_usuarios_id_rol ON public.usuarios (id_rol);
CREATE INDEX IF NOT EXISTS idx_reservas_aula_fecha ON public.reservas (id_aula, fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_bitacora_usuario ON public.bitacora_actividad (id_usuario);

COMMIT;
