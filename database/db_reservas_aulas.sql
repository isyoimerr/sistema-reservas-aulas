CREATE DATABASE IF NOT EXISTS db_reservas_aulas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_reservas_aulas;

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO roles (id_rol, nombre_rol) VALUES 
(1, 'Superadministrador'),
(2, 'Profesor');

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE aulas (
    id_aula INT AUTO_INCREMENT PRIMARY KEY,
    codigo_aula VARCHAR(20) NOT NULL UNIQUE,
    nombre_aula VARCHAR(100) NOT NULL,
    capacidad INT NOT NULL,
    equipamiento TEXT NULL,
    estado ENUM('Activo', 'Inactivo', 'Mantenimiento') DEFAULT 'Activo',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE horarios_docentes (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_aula INT NOT NULL,
    dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_horarios_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_horarios_aulas FOREIGN KEY (id_aula) REFERENCES aulas(id_aula) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_aula INT NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo TEXT NULL,
    estado ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada') DEFAULT 'Pendiente',
    id_admin_gestion INT NULL,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservas_aulas FOREIGN KEY (id_aula) REFERENCES aulas(id_aula) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservas_admin FOREIGN KEY (id_admin_gestion) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_reservas_horario CHECK (hora_fin > hora_inicio)
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER trg_reservas_no_solapadas_insert
BEFORE INSERT ON reservas
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM reservas r
        WHERE r.id_aula = NEW.id_aula
          AND r.fecha_reserva = NEW.fecha_reserva
          AND r.estado IN ('Pendiente', 'Aprobada')
          AND NEW.hora_inicio < r.hora_fin
          AND NEW.hora_fin > r.hora_inicio
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El aula ya tiene una reserva activa en ese horario.';
    END IF;
END$$

CREATE TRIGGER trg_reservas_no_solapadas_update
BEFORE UPDATE ON reservas
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM reservas r
        WHERE r.id_aula = NEW.id_aula
          AND r.fecha_reserva = NEW.fecha_reserva
          AND r.id_reserva <> NEW.id_reserva
          AND r.estado IN ('Pendiente', 'Aprobada')
          AND NEW.hora_inicio < r.hora_fin
          AND NEW.hora_fin > r.hora_inicio
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede actualizar la reserva porque solapa otra reserva del aula.';
    END IF;
END$$
DELIMITER ;

CREATE TABLE historial_reservas (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    id_usuario_accion INT NOT NULL,
    accion_realizada VARCHAR(100) NOT NULL,
    estado_anterior ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada') NULL,
    estado_nuevo ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada') NOT NULL,
    observaciones TEXT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_reservas FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_usuarios FOREIGN KEY (id_usuario_accion) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE bitacora_actividad (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_usuario VARCHAR(200) NOT NULL,
    rol_usuario VARCHAR(50) NOT NULL,
    tipo VARCHAR(80) NOT NULL,
    accion VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    entidad VARCHAR(80) NULL,
    entidad_id INT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bitacora_actividad_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_bitacora_usuario (id_usuario),
    INDEX idx_bitacora_fecha (fecha_registro)
) ENGINE=InnoDB;

INSERT INTO usuarios (nombre, apellido, email, password, id_rol, estado) VALUES
('Admin', 'Sistema', 'admin@sistema.com', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 1, 'Activo');

-- Contraseña por defecto: admin123
