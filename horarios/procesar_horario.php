<?php
session_start();
require_once '../config/rbac.php';
require_once '../config/logs.php';

$idUsuario = $_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? null;
$rolActual = currentUserRole();

if (!$idUsuario) {
    session_unset();
    session_destroy();
    header('Location: ../login/index.php');
    exit;
}

if (normalizeRole($rolActual) !== 'Superadministrador') {
    session_unset();
    session_destroy();
    header('Location: ../login/index.php?error=acceso_denegado');
    exit;
}

require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: cargar_horario.php');
    exit;
}

$idUsuario = (int) ($_POST['id_usuario'] ?? 0);
$idAula = (int) ($_POST['id_aula'] ?? 0);
$diaSemana = $_POST['dia_semana'] ?? '';
$horaInicio = $_POST['hora_inicio'] ?? '';
$horaFin = $_POST['hora_fin'] ?? '';

if ($idUsuario <= 0 || $idAula <= 0 || $diaSemana === '' || $horaInicio === '' || $horaFin === '') {
    $_SESSION['mensaje_horario'] = 'Debe completar todos los campos.';
    header('Location: cargar_horario.php');
    exit;
}

if ($horaFin <= $horaInicio) {
    $_SESSION['mensaje_horario'] = 'La hora de fin debe ser mayor que la de inicio.';
    header('Location: cargar_horario.php');
    exit;
}

$validarUsuario = $pdo->prepare('SELECT id_usuario FROM usuarios WHERE id_usuario = :id_usuario AND estado = "Activo" LIMIT 1');
$validarUsuario->execute([':id_usuario' => $idUsuario]);
if (!$validarUsuario->fetch()) {
    $_SESSION['mensaje_horario'] = 'El profesor seleccionado no está activo.';
    header('Location: cargar_horario.php');
    exit;
}

$validarAula = $pdo->prepare('SELECT id_aula FROM aulas WHERE id_aula = :id_aula AND estado IN ("Activo", "Mantenimiento") LIMIT 1');
$validarAula->execute([':id_aula' => $idAula]);
if (!$validarAula->fetch()) {
    $_SESSION['mensaje_horario'] = 'El aula seleccionada no está disponible.';
    header('Location: cargar_horario.php');
    exit;
}

$check = $pdo->prepare(
    'SELECT id_horario FROM horarios_docentes
     WHERE id_usuario = :id_usuario AND dia_semana = :dia_semana
     AND ((:hora_inicio < hora_fin AND hora_inicio < :hora_fin AND hora_fin > :hora_inicio))'
);
$check->execute([
    ':id_usuario' => $idUsuario,
    ':dia_semana' => $diaSemana,
    ':hora_inicio' => $horaInicio,
    ':hora_fin' => $horaFin,
]);

if ($check->fetch()) {
    $_SESSION['mensaje_horario'] = 'Ya existe un horario solapado para ese profesor en ese día.';
    header('Location: cargar_horario.php');
    exit;
}

$insert = $pdo->prepare(
    'INSERT INTO horarios_docentes (id_usuario, id_aula, dia_semana, hora_inicio, hora_fin)
     VALUES (:id_usuario, :id_aula, :dia_semana, :hora_inicio, :hora_fin)'
);

$insert->execute([
    ':id_usuario' => $idUsuario,
    ':id_aula' => $idAula,
    ':dia_semana' => $diaSemana,
    ':hora_inicio' => $horaInicio,
    ':hora_fin' => $horaFin,
]);

$idHorarioCreado = (int) $pdo->lastInsertId();
registrarActividad(
    $pdo,
    (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? 0),
    'horario',
    'Registro de horario',
    'Se registró el horario del profesor para el día ' . $diaSemana . ' de ' . $horaInicio . ' a ' . $horaFin . '.',
    $idHorarioCreado,
    'horarios'
);

$_SESSION['mensaje_horario'] = 'Horario docente registrado correctamente.';
header('Location: cargar_horario.php');
exit;
