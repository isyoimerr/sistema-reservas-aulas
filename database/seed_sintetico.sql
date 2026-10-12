USE db_reservas_aulas;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE historial_reservas;
TRUNCATE TABLE reservas;
TRUNCATE TABLE horarios_docentes;
TRUNCATE TABLE aulas;
TRUNCATE TABLE usuarios;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO usuarios (id_usuario, nombre, apellido, email, password, id_rol, estado) VALUES
(1, 'Admin', 'Sistema', 'admin@sistema.com', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 1, 'Activo'),
(2, 'Laura', 'García', 'laura.garcia@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(3, 'Carlos', 'Ortiz', 'carlos.ortiz@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(4, 'Daniela', 'Rivera', 'daniela.rivera@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(5, 'José', 'Morales', 'jose.morales@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(6, 'Sofía', 'Pérez', 'sofia.perez@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(7, 'Andrés', 'Castillo', 'andres.castillo@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(8, 'Mariana', 'López', 'mariana.lopez@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(9, 'Roberto', 'González', 'roberto.gonzalez@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(10, 'Valentina', 'Ríos', 'valentina.rios@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Activo'),
(11, 'Lucía', 'Mendoza', 'lucia.mendoza@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Inactivo'),
(12, 'Nicolás', 'Mendoza', 'nicolas.mendoza@institucion.edu', '$2y$10$Yq3BNTxfM5XgEGw3YVNWEOmqrEgzZwTv0MvfEx2DMw6GBqtp7VPP6', 2, 'Inactivo');

INSERT INTO aulas (id_aula, codigo_aula, nombre_aula, capacidad, equipamiento, estado) VALUES
(1, 'A-101', 'Aula 101', 30, 'Proyector, pizarra digital, Wi-Fi', 'Activo'),
(2, 'A-102', 'Aula 102', 25, 'Proyector, TV, Wi-Fi', 'Activo'),
(3, 'A-103', 'Aula 103', 35, 'Proyector, video beam, Wi-Fi', 'Activo'),
(4, 'A-104', 'Aula 104', 20, 'Pizarra, Wi-Fi', 'Activo'),
(5, 'LAB-01', 'Laboratorio 01', 18, 'Computadores, proyector, Wi-Fi', 'Activo'),
(6, 'LAB-02', 'Laboratorio 02', 22, 'Computadores, pizarra, Wi-Fi', 'Activo'),
(7, 'AUD-01', 'Auditorio 01', 60, 'Sistema de audio, proyector, Wi-Fi', 'Activo'),
(8, 'S-COORD', 'Sala de coordinación', 12, 'Mesa, sillas, TV', 'Mantenimiento');

INSERT INTO horarios_docentes (id_horario, id_usuario, id_aula, dia_semana, hora_inicio, hora_fin) VALUES
(1, 2, 1, 'Lunes', '07:00:00', '09:00:00'),
(2, 2, 1, 'Miércoles', '07:00:00', '09:00:00'),
(3, 3, 2, 'Martes', '08:00:00', '10:00:00'),
(4, 3, 2, 'Jueves', '08:00:00', '10:00:00'),
(5, 4, 3, 'Lunes', '10:00:00', '12:00:00'),
(6, 4, 3, 'Viernes', '10:00:00', '12:00:00'),
(7, 5, 4, 'Martes', '09:00:00', '11:00:00'),
(8, 5, 4, 'Jueves', '09:00:00', '11:00:00'),
(9, 6, 5, 'Miércoles', '13:00:00', '15:00:00'),
(10, 6, 5, 'Viernes', '13:00:00', '15:00:00'),
(11, 7, 6, 'Lunes', '14:00:00', '16:00:00'),
(12, 7, 6, 'Miércoles', '14:00:00', '16:00:00'),
(13, 8, 7, 'Martes', '15:00:00', '17:00:00'),
(14, 8, 7, 'Jueves', '15:00:00', '17:00:00'),
(15, 9, 1, 'Viernes', '08:00:00', '10:00:00'),
(16, 9, 2, 'Sábado', '09:00:00', '11:00:00'),
(17, 10, 8, 'Lunes', '09:00:00', '11:00:00'),
(18, 10, 8, 'Miércoles', '09:00:00', '11:00:00');

INSERT INTO reservas (id_reserva, id_usuario, id_aula, fecha_reserva, hora_inicio, hora_fin, motivo, estado, id_admin_gestion, fecha_solicitud) VALUES
(1, 2, 1, '2026-10-07', '08:00:00', '10:00:00', 'Reunión de coordinación de área', 'Pendiente', 1, '2026-10-06 09:00:00'),
(2, 3, 2, '2026-10-07', '09:00:00', '11:00:00', 'Clase de matemáticas', 'Aprobada', 1, '2026-10-05 08:30:00'),
(3, 4, 3, '2026-10-08', '13:00:00', '15:00:00', 'Taller de laboratorio', 'Rechazada', 1, '2026-10-06 10:15:00'),
(4, 5, 4, '2026-10-09', '07:00:00', '09:00:00', 'Consulta docente', 'Cancelada', 1, '2026-10-04 16:00:00'),
(5, 6, 5, '2026-10-09', '10:00:00', '12:00:00', 'Práctica de programación', 'Pendiente', 1, '2026-10-06 11:00:00'),
(6, 7, 6, '2026-10-12', '15:00:00', '17:00:00', 'Clase de química', 'Aprobada', 1, '2026-10-03 12:40:00'),
(7, 8, 7, '2026-10-13', '08:30:00', '10:30:00', 'Exposición institucional', 'Pendiente', 1, '2026-10-06 13:10:00'),
(8, 9, 1, '2026-10-13', '12:00:00', '14:00:00', 'Capacitación en lectura crítica', 'Aprobada', 1, '2026-10-02 17:00:00'),
(9, 10, 2, '2026-10-14', '11:00:00', '13:00:00', 'Tutoría de desarrollo personal', 'Pendiente', 1, '2026-10-06 08:50:00'),
(10, 11, 3, '2026-10-15', '16:00:00', '18:00:00', 'Reserva de prueba inactiva', 'Aprobada', 1, '2026-10-06 15:00:00'),
(11, 12, 4, '2026-10-16', '09:00:00', '10:30:00', 'Presentación de proyecto', 'Rechazada', 1, '2026-10-05 14:45:00'),
(12, 2, 5, '2026-10-19', '14:00:00', '16:00:00', 'Taller de robótica', 'Pendiente', 1, '2026-10-06 07:30:00');

INSERT INTO historial_reservas (id_historial, id_reserva, id_usuario_accion, accion_realizada, estado_anterior, estado_nuevo, observaciones, fecha_registro) VALUES
(1, 2, 1, 'Aprobada', 'Pendiente', 'Aprobada', 'Se confirma disponibilidad de aula y horario.', '2026-10-06 08:00:00'),
(2, 3, 1, 'Rechazada', 'Pendiente', 'Rechazada', 'El horario solicitado coincide con otra prioridad institucional.', '2026-10-06 09:30:00'),
(3, 4, 1, 'Cancelada', 'Pendiente', 'Cancelada', 'El docente solicitó cancelar la reserva por cambio de agenda.', '2026-10-06 10:00:00'),
(4, 6, 1, 'Aprobada', 'Pendiente', 'Aprobada', 'Laboratorio disponible y autorizado por coordinación.', '2026-10-06 12:00:00'),
(5, 8, 1, 'Aprobada', 'Pendiente', 'Aprobada', 'Aula 101 disponible en horario solicitado.', '2026-10-06 13:00:00'),
(6, 10, 1, 'Aprobada', 'Pendiente', 'Aprobada', 'Usuario inactivo aprobado manualmente para prueba.', '2026-10-06 15:00:00'),
(7, 11, 1, 'Rechazada', 'Pendiente', 'Rechazada', 'Se requiere ajustar fecha por conflicto de actividades.', '2026-10-06 16:00:00');

SELECT 'Datos sintéticos cargados correctamente.' AS estado;
