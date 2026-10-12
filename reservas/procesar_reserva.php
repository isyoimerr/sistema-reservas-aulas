<?php
session_start();
require_once '../config/rbac.php';

$idUsuario = $_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? null;
$rolActual = currentUserRole();

if (!$idUsuario) {
    session_unset();
    session_destroy();
    header('Location: ../login/index.php');
    exit;
}

if (!in_array(normalizeRole($rolActual), ['Profesor', 'Superadministrador'], true)) {
    session_unset();
    session_destroy();
    header('Location: ../login/index.php?error=acceso_denegado');
    exit;
}

require_once '../config/conexion.php';
require_once '../config/logs.php';
require_once 'validar_reserva.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: crear_reserva.php');
    exit;
}

$idUsuario = (int) $idUsuario;
$idAula = (int) ($_POST['id_aula'] ?? 0);
$fechaReserva = trim($_POST['fecha_reserva'] ?? '');
$horaInicio = $_POST['hora_inicio'] ?? '';
$horaFin = $_POST['hora_fin'] ?? '';
$motivo = trim($_POST['motivo'] ?? '');

if ($idAula <= 0 || $fechaReserva === '' || $horaInicio === '' || $horaFin === '') {
    $_SESSION['reserva_error'] = 'Debe completar aula, fecha y horario.';
    header('Location: crear_reserva.php');
    exit;
}

if ($horaFin <= $horaInicio) {
    $_SESSION['reserva_error'] = 'La hora de fin debe ser mayor que la hora de inicio.';
    header('Location: crear_reserva.php');
    exit;
}

$validacion = validarReserva($pdo, $idUsuario, $idAula, $fechaReserva, $horaInicio, $horaFin);
if (!$validacion['ok']) {
    $_SESSION['reserva_error'] = $validacion['mensaje'];
    header('Location: crear_reserva.php');
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO reservas (id_usuario, id_aula, fecha_reserva, hora_inicio, hora_fin, motivo, estado)
     VALUES (:id_usuario, :id_aula, :fecha_reserva, :hora_inicio, :hora_fin, :motivo, "Pendiente")'
);

$stmt->execute([
    ':id_usuario' => $idUsuario,
    ':id_aula' => $idAula,
    ':fecha_reserva' => $fechaReserva,
    ':hora_inicio' => $horaInicio,
    ':hora_fin' => $horaFin,
    ':motivo' => $motivo,
]);

$idReserva = (int) $pdo->lastInsertId();

$historial = $pdo->prepare(
    'INSERT INTO historial_reservas (id_reserva, id_usuario_accion, accion_realizada, estado_anterior, estado_nuevo, observaciones)
     VALUES (:id_reserva, :id_usuario_accion, "Creación", NULL, "Pendiente", :observaciones)'
);
$historial->execute([
    ':id_reserva' => $idReserva,
    ':id_usuario_accion' => $idUsuario,
    ':observaciones' => 'Reserva creada por el docente.',
]);

registrarActividad(
    $pdo,
    $idUsuario,
    'reserva',
    'Creación de reserva',
    'Se creó la reserva para la fecha ' . $fechaReserva . ' en el horario ' . $horaInicio . ' - ' . $horaFin . '.',
    $idReserva,
    'reservas'
);

$_SESSION['reserva_exito'] = 'Su reserva fue enviada correctamente y queda en estado Pendiente.';
header('Location: crear_reserva.php');
exit;
