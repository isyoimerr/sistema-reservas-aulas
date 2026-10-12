<?php
session_start();
require_once '../config/rbac.php';
require_once '../config/conexion.php';
require_once '../config/logs.php';

requireAdmin('../login/index.php', 'No tienes permisos para gestionar aulas.');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: gestionar_aula.php');
    exit;
}

$codigo = trim($_POST['codigo_aula'] ?? '');
$nombre = trim($_POST['nombre_aula'] ?? '');
$capacidad = (int) ($_POST['capacidad'] ?? 0);
$estado = $_POST['estado'] ?? 'Activo';
$equipamiento = trim($_POST['equipamiento'] ?? '');

if ($codigo === '' || $nombre === '' || $capacidad <= 0) {
    http_response_code(400);
    $_SESSION['rbac_error'] = 'Debe completar código, nombre y capacidad válida.';
    header('Location: gestionar_aula.php?error=400');
    exit;
}

if (!in_array($estado, ['Activo', 'Inactivo', 'Mantenimiento'], true)) {
    http_response_code(400);
    $_SESSION['rbac_error'] = 'Estado inválido.';
    header('Location: gestionar_aula.php?error=400');
    exit;
}

$stmt = $pdo->prepare('SELECT id_aula FROM aulas WHERE codigo_aula = :codigo LIMIT 1');
$stmt->execute([':codigo' => $codigo]);

if ($stmt->fetch()) {
    http_response_code(409);
    $_SESSION['rbac_error'] = 'Ya existe un aula con ese código.';
    header('Location: gestionar_aula.php?error=409');
    exit;
}

$insert = $pdo->prepare(
    'INSERT INTO aulas (codigo_aula, nombre_aula, capacidad, equipamiento, estado)
     VALUES (:codigo, :nombre, :capacidad, :equipamiento, :estado)'
);

$insert->execute([
    ':codigo' => $codigo,
    ':nombre' => $nombre,
    ':capacidad' => $capacidad,
    ':equipamiento' => $equipamiento,
    ':estado' => $estado,
]);

$idAulaCreada = (int) $pdo->lastInsertId();
registrarActividad(
    $pdo,
    (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? 0),
    'aula',
    'Registro de aula',
    'Se registró el aula ' . $nombre . ' con código ' . $codigo . '.',
    $idAulaCreada,
    'aulas'
);

$_SESSION['rbac_success'] = 'Aula registrada correctamente.';
header('Location: gestionar_aula.php');
exit;
