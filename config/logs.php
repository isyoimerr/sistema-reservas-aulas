<?php
require_once __DIR__ . '/rbac.php';

function asegurarTablaBitacora(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS bitacora_actividad (
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
            INDEX idx_bitacora_usuario (id_usuario),
            INDEX idx_bitacora_fecha (fecha_registro),
            CONSTRAINT fk_bitacora_actividad_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB'
    );
}

function registrarActividad(PDO $pdo, int $idUsuario, string $tipo, string $accion, string $descripcion = '', ?int $entidadId = null, ?string $entidad = null): void
{
    asegurarTablaBitacora($pdo);

    if ($idUsuario <= 0) {
        return;
    }

    $usuarioStmt = $pdo->prepare(
        'SELECT u.nombre, u.apellido, r.nombre_rol AS rol
         FROM usuarios u
         LEFT JOIN roles r ON r.id_rol = u.id_rol
         WHERE u.id_usuario = :id_usuario
         LIMIT 1'
    );
    $usuarioStmt->execute([':id_usuario' => $idUsuario]);
    $usuario = $usuarioStmt->fetch(PDO::FETCH_ASSOC);

    $nombreCompleto = trim((string) ($usuario['nombre'] ?? '')) . ' ' . trim((string) ($usuario['apellido'] ?? ''));
    $nombreCompleto = trim($nombreCompleto) ?: 'Usuario';
    $rolUsuario = normalizeRole((string) ($usuario['rol'] ?? ''));
    $tipoActividad = trim($tipo) !== '' ? $tipo : 'Sistema';
    $accionActividad = trim($accion) !== '' ? $accion : 'Actualización';
    $descripcionActividad = trim($descripcion) !== '' ? $descripcion : $accionActividad;

    $insert = $pdo->prepare(
        'INSERT INTO bitacora_actividad (id_usuario, nombre_usuario, rol_usuario, tipo, accion, descripcion, entidad, entidad_id, fecha_registro)
         VALUES (:id_usuario, :nombre_usuario, :rol_usuario, :tipo, :accion, :descripcion, :entidad, :entidad_id, NOW())'
    );

    $insert->execute([
        ':id_usuario' => $idUsuario,
        ':nombre_usuario' => $nombreCompleto,
        ':rol_usuario' => $rolUsuario !== '' ? $rolUsuario : 'Profesor',
        ':tipo' => $tipoActividad,
        ':accion' => $accionActividad,
        ':descripcion' => $descripcionActividad,
        ':entidad' => $entidad !== null && trim($entidad) !== '' ? trim($entidad) : null,
        ':entidad_id' => $entidadId,
    ]);
}

function obtenerActividadReciente(PDO $pdo, ?int $idUsuario = null, int $limite = 8): array
{
    return obtenerActividadPorTipo($pdo, null, $idUsuario, $limite);
}

function obtenerActividadPorTipo(PDO $pdo, ?string $tipo = null, ?int $idUsuario = null, int $limite = 8): array
{
    asegurarTablaBitacora($pdo);

    $sql = 'SELECT b.id_log, b.id_usuario, b.nombre_usuario, b.rol_usuario, b.tipo, b.accion, b.descripcion, b.entidad, b.entidad_id, b.fecha_registro
            FROM bitacora_actividad b';
    $params = [];
    $whereClauses = [];

    if ($tipo !== null && trim($tipo) !== '') {
        $whereClauses[] = 'b.tipo = :tipo';
        $params[':tipo'] = trim($tipo);
    }

    if ($idUsuario !== null) {
        $whereClauses[] = 'b.id_usuario = :id_usuario';
        $params[':id_usuario'] = (int) $idUsuario;
    }

    if (!empty($whereClauses)) {
        $sql .= ' WHERE ' . implode(' AND ', $whereClauses);
    }

    $sql .= ' ORDER BY b.fecha_registro DESC LIMIT :limite';
    $stmt = $pdo->prepare($sql);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }

    $stmt->bindValue(':limite', max(1, (int) $limite), PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
