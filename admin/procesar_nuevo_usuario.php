<?php
session_start();
require_once __DIR__ . '/../config/rbac.php';
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/logs.php';

requireAdmin('../login/index.php', 'Solo el administrador puede crear usuarios.');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $_SESSION['rbac_error'] = 'Método no permitido.';
    header('Location: gestionar_usuarios.php?error=405');
    exit;
}

$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$rol = normalizeRole(trim((string) ($_POST['rol'] ?? 'Profesor')));
$estado = trim((string) ($_POST['estado'] ?? 'Activo'));

if ($nombre === '' || $apellido === '' || $email === '' || $password === '') {
    $_SESSION['rbac_error'] = 'Nombre, apellido, correo y contraseña son obligatorios.';
    header('Location: gestionar_usuarios.php?error=400');
    exit;
}

if (!in_array($estado, ['Activo', 'Inactivo'], true)) {
    $_SESSION['rbac_error'] = 'El estado del usuario no es válido.';
    header('Location: gestionar_usuarios.php?error=400');
    exit;
}

if (strlen($password) < 6) {
    $_SESSION['rbac_error'] = 'La contraseña debe tener al menos 6 caracteres.';
    header('Location: gestionar_usuarios.php?error=400');
    exit;
}

$existing = $pdo->prepare('SELECT id_usuario FROM usuarios WHERE email = :email LIMIT 1');
$existing->execute([':email' => $email]);
if ($existing->fetch()) {
    $_SESSION['rbac_error'] = 'Ya existe un usuario con ese correo.';
    header('Location: gestionar_usuarios.php?error=409');
    exit;
}

$roleStmt = $pdo->prepare('SELECT id_rol FROM roles WHERE nombre_rol = :nombre_rol LIMIT 1');
$roleStmt->execute([':nombre_rol' => $rol]);
$role = $roleStmt->fetch();

if (!$role) {
    $_SESSION['rbac_error'] = 'El rol seleccionado no existe.';
    header('Location: gestionar_usuarios.php?error=400');
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$insert = $pdo->prepare(
    'INSERT INTO usuarios (nombre, apellido, email, password, id_rol, estado, cargo, area, cc, avatar)
     VALUES (:nombre, :apellido, :email, :password, :id_rol, :estado, :cargo, :area, :cc, :avatar)'
);
$insert->execute([
    ':nombre' => $nombre,
    ':apellido' => $apellido,
    ':email' => $email,
    ':password' => $hash,
    ':id_rol' => (int) $role['id_rol'],
    ':estado' => $estado,
    ':cargo' => null,
    ':area' => null,
    ':cc' => null,
    ':avatar' => 'img/default-avatar.svg',
]);

$idNuevoUsuario = (int) $pdo->lastInsertId();
registrarActividad(
    $pdo,
    (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? 0),
    'usuario',
    'Creación de usuario',
    'Se creó el usuario ' . $nombre . ' ' . $apellido . ' con rol ' . $rol . '.',
    $idNuevoUsuario,
    'usuarios'
);

$_SESSION['rbac_success'] = 'Usuario creado correctamente con el rol seleccionado.';
header('Location: gestionar_usuarios.php');
exit;
