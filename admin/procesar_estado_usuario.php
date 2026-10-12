<?php
session_start();
require_once '../config/rbac.php';
require_once '../config/conexion.php';
require_once '../config/logs.php';

requireAdmin('../login/index.php', 'No tienes permisos para modificar usuarios.');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: gestionar_usuarios.php');
    exit;
}

$idUsuario = (int) ($_POST['id_usuario'] ?? 0);
$estado = $_POST['estado'] ?? '';

if ($idUsuario <= 0 || !in_array($estado, ['Activo', 'Inactivo'], true)) {
    http_response_code(400);
    $_SESSION['rbac_error'] = 'Datos inválidos para actualizar el usuario.';
    header('Location: gestionar_usuarios.php?error=400');
    exit;
}

$stmt = $pdo->prepare('UPDATE usuarios SET estado = :estado WHERE id_usuario = :id_usuario');
$stmt->execute([
    ':estado' => $estado,
    ':id_usuario' => $idUsuario,
]);

$actorId = (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? 0);
registrarActividad(
    $pdo,
    $actorId,
    'usuario',
    'Cambio de estado',
    'Se actualizó el estado del usuario a ' . $estado . '.',
    $idUsuario,
    'usuarios'
);

$_SESSION['rbac_success'] = 'Estado actualizado correctamente.';
header('Location: gestionar_usuarios.php');
exit;
