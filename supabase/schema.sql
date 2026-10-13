-- Schema para Supabase
-- Compatible con Postgres

CREATE TYPE rol_nombre AS ENUM ('Superadministrador', 'Profesor');
CREATE TYPE usuario_estado AS ENUM ('Activo', 'Inactivo');
CREATE TYPE aula_estado AS ENUM ('Activo', 'Inactivo', 'Mantenimiento');
CREATE TYPE dia_semana AS ENUM ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado');
CREATE TYPE reserva_estado AS ENUM ('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada');

CREATE TABLE roles (
    id_rol INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    estado usuario_estado DEFAULT 'Activo',
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON UPDATE CASCADE
);

CREATE TABLE aulas (
    id_aula INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_aula VARCHAR(20) NOT NULL UNIQUE,
    nombre_aula VARCHAR(100) NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    equipamiento TEXT,
    estado aula_estado DEFAULT 'Activo',
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE horarios_docentes (
    id_horario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_aula INT NOT NULL,
    dia_semana dia_semana NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_horarios_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_horarios_aulas FOREIGN KEY (id_aula) REFERENCES aulas(id_aula) ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (hora_fin > hora_inicio)
);

CREATE TABLE reservas (
    id_reserva INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_aula INT NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo TEXT,
    estado reserva_estado DEFAULT 'Pendiente',
    id_admin_gestion INT,
    fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_reservas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservas_aulas FOREIGN KEY (id_aula) REFERENCES aulas(id_aula) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservas_admin FOREIGN KEY (id_admin_gestion) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CHECK (hora_fin > hora_inicio)
);

CREATE TABLE historial_reservas (
    id_historial INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva INT NOT NULL,
    id_usuario_accion INT NOT NULL,
    accion_realizada VARCHAR(100) NOT NULL,
    estado_anterior reserva_estado,
    estado_nuevo reserva_estado NOT NULL,
    observaciones TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_historial_reservas FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_usuarios FOREIGN KEY (id_usuario_accion) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE bitacora_actividad (
    id_log INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_usuario VARCHAR(200) NOT NULL,
    rol_usuario VARCHAR(50) NOT NULL,
    tipo VARCHAR(80) NOT NULL,
    accion VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    entidad VARCHAR(80),
    entidad_id INT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_bitacora_actividad_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitacora_actividad ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.user_has_role(_role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios u
        INNER JOIN public.roles r ON r.id_rol = u.id_rol
        WHERE lower(COALESCE(u.email, '')) = lower(COALESCE(auth.email(), ''))
          AND lower(r.nombre_rol) = lower(_role_name)
    );
END;
$$;

CREATE POLICY "roles_select_public" ON roles FOR SELECT USING (true);
CREATE POLICY "usuarios_select_own_or_admin" ON usuarios FOR SELECT USING (
    lower(COALESCE(email, '')) = lower(COALESCE(auth.email(), ''))
    OR user_has_role('Superadministrador')
);
CREATE POLICY "usuarios_insert_admin_only" ON usuarios FOR INSERT WITH CHECK (user_has_role('Superadministrador'));
CREATE POLICY "usuarios_update_admin_only" ON usuarios FOR UPDATE USING (user_has_role('Superadministrador')) WITH CHECK (user_has_role('Superadministrador'));
CREATE POLICY "aulas_select_public" ON aulas FOR SELECT USING (true);
CREATE POLICY "aulas_insert_admin_only" ON aulas FOR INSERT WITH CHECK (user_has_role('Superadministrador'));
CREATE POLICY "aulas_update_admin_only" ON aulas FOR UPDATE USING (user_has_role('Superadministrador')) WITH CHECK (user_has_role('Superadministrador'));
CREATE POLICY "aulas_delete_admin_only" ON aulas FOR DELETE USING (user_has_role('Superadministrador'));
CREATE POLICY "horarios_select_own_or_admin" ON horarios_docentes FOR SELECT USING (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
);
CREATE POLICY "horarios_manage_own_or_admin" ON horarios_docentes FOR INSERT WITH CHECK (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
);
CREATE POLICY "horarios_update_own_or_admin" ON horarios_docentes FOR UPDATE USING (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
) WITH CHECK (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
);
CREATE POLICY "reservas_select_own_or_admin" ON reservas FOR SELECT USING (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
);
CREATE POLICY "reservas_insert_own_or_admin" ON reservas FOR INSERT WITH CHECK (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
);
CREATE POLICY "reservas_update_own_or_admin" ON reservas FOR UPDATE USING (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
) WITH CHECK (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
);
CREATE POLICY "historial_select_admin_only" ON historial_reservas FOR SELECT USING (user_has_role('Superadministrador'));
CREATE POLICY "historial_insert_admin_or_owner" ON historial_reservas FOR INSERT WITH CHECK (
    user_has_role('Superadministrador')
    OR id_usuario_accion = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
);
CREATE POLICY "bitacora_select_admin_only" ON bitacora_actividad FOR SELECT USING (user_has_role('Superadministrador'));
CREATE POLICY "bitacora_insert_own_or_admin" ON bitacora_actividad FOR INSERT WITH CHECK (
    id_usuario = (SELECT u.id_usuario FROM public.usuarios u WHERE lower(u.email) = lower(COALESCE(auth.email(), '')) LIMIT 1)
    OR user_has_role('Superadministrador')
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX idx_aulas_estado ON aulas(estado);
CREATE INDEX idx_horarios_usuario_aula ON horarios_docentes(id_usuario, id_aula);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_reserva, estado);
CREATE INDEX idx_reservas_usuario ON reservas(id_usuario);

INSERT INTO roles (id_rol, nombre_rol) VALUES
(1, 'Superadministrador'),
(2, 'Profesor');

INSERT INTO usuarios (nombre, apellido, email, password, id_rol, estado)
VALUES (
    'Admin',
    'Sistema',
    'admin@sistema.com',
    '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6',
    1,
    'Activo'
);

-- Contraseña por defecto: admin123

CREATE OR REPLACE FUNCTION validar_solapamiento_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM reservas r
        WHERE r.id_aula = NEW.id_aula
          AND r.fecha_reserva = NEW.fecha_reserva
          AND r.estado IN ('Pendiente', 'Aprobada')
          AND r.id_reserva <> COALESCE(NEW.id_reserva, -1)
          AND NEW.hora_inicio < r.hora_fin
          AND NEW.hora_fin > r.hora_inicio
    ) THEN
        RAISE EXCEPTION 'El aula ya tiene una reserva activa en ese horario.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reservas_no_solapadas_insert
BEFORE INSERT ON reservas
FOR EACH ROW
EXECUTE FUNCTION validar_solapamiento_reserva();

CREATE TRIGGER trg_reservas_no_solapadas_update
BEFORE UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION validar_solapamiento_reserva();
