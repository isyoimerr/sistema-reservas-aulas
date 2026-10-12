<?php
session_start();
require_once __DIR__ . '/../config/rbac.php';
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/logs.php';

requireAdmin('../login/index.php', 'No tienes permisos para gestionar reservas.');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $_SESSION['rbac_error'] = 'Método no permitido.';
    header('Location: ../reservas/consultar.php?error=405');
    exit;
}

$idReserva = (int) ($_POST['id_reserva'] ?? 0);
$accion = trim((string) ($_POST['accion'] ?? ''));
$estadoNuevo = null;

if ($idReserva <= 0 || !in_array($accion, ['Aprobar', 'Rechazar', 'Eliminar'], true)) {
    http_response_code(400);
    $_SESSION['rbac_error'] = 'Parámetros de reserva inválidos.';
    header('Location: ../reservas/consultar.php?error=400');
    exit;
}

if ($accion === 'Aprobar') {
    $estadoNuevo = 'Aprobada';
} elseif ($accion === 'Rechazar') {
    $estadoNuevo = 'Rechazada';
} else {
    $estadoNuevo = 'Cancelada';
}

$stmt = $pdo->prepare('SELECT id_reserva, id_usuario, estado FROM reservas WHERE id_reserva = :id_reserva LIMIT 1');
$stmt->execute([':id_reserva' => $idReserva]);
$reserva = $stmt->fetch();

if (!$reserva) {
    http_response_code(404);
    $_SESSION['rbac_error'] = 'La reserva no existe.';
    header('Location: ../reservas/consultar.php?error=404');
    exit;
}

$estadoAnterior = $reserva['estado'];
$pdo->beginTransaction();

try {
    $update = $pdo->prepare('UPDATE reservas SET estado = :estado, id_admin_gestion = :admin WHERE id_reserva = :id_reserva');
    $update->execute([
        ':estado' => $estadoNuevo,
        ':admin' => (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id']),
        ':id_reserva' => $idReserva,
    ]);

    $historial = $pdo->prepare(
        'INSERT INTO historial_reservas (id_reserva, id_usuario_accion, accion_realizada, estado_anterior, estado_nuevo, observaciones)
         VALUES (:id_reserva, :id_usuario_accion, :accion, :estado_anterior, :estado_nuevo, :observaciones)'
    );
    $historial->execute([
        ':id_reserva' => $idReserva,
        ':id_usuario_accion' => (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id']),
        ':accion' => $accion,
        ':estado_anterior' => $estadoAnterior,
        ':estado_nuevo' => $estadoNuevo,
        ':observaciones' => 'Actualización ejecutada por el administrador desde el panel de control.'
    ]);

    $actorId = (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? 0);
    registrarActividad(
        $pdo,
        $actorId,
        'reserva',
        $accion,
        'Se actualizó la reserva a estado ' . $estadoNuevo . ' desde el panel administrativo.',
        $idReserva,
        'reservas'
    );

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    $_SESSION['rbac_error'] = 'No se pudo procesar la operación sobre la reserva.';
    header('Location: ../reservas/consultar.php?error=500');
    exit;
}

$_SESSION['rbac_error'] = null;
$_SESSION['rbac_success'] = 'La operación de reserva se ejecutó correctamente.';
header('Location: ../reservas/consultar.php');
exit;
