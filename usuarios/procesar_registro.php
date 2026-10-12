<?php
session_start();
require_once '../config/conexion.php';
require_once '../config/logs.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: registro_profesor.php');
    exit;
}

$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$cargo = trim($_POST['cargo'] ?? '');
$area = trim($_POST['area'] ?? '');
$cc = trim($_POST['cc'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

if ($nombre === '' || $apellido === '' || $email === '' || $password === '' || $confirm_password === '') {
    $_SESSION['registro_error'] = 'Todos los campos son obligatorios.';
    header('Location: registro_profesor.php');
    exit;
}

if ($password !== $confirm_password) {
    $_SESSION['registro_error'] = 'Las contraseñas no coinciden.';
    header('Location: registro_profesor.php');
    exit;
}

if (strlen($password) < 6) {
    $_SESSION['registro_error'] = 'La contraseña debe tener al menos 6 caracteres.';
    header('Location: registro_profesor.php');
    exit;
}

$stmt = $pdo->prepare('SELECT id_usuario FROM usuarios WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);

if ($stmt->fetch()) {
    $_SESSION['registro_error'] = 'Ya existe un usuario registrado con ese correo.';
    header('Location: registro_profesor.php');
    exit;
}

$rolSolicitado = trim((string) ($_POST['rol'] ?? 'Profesor'));
$roleStmt = $pdo->prepare('SELECT id_rol FROM roles WHERE nombre_rol = :nombre_rol LIMIT 1');
$roleStmt->execute([':nombre_rol' => $rolSolicitado]);
$role = $roleStmt->fetch();

if ($rolSolicitado === '') {
    $rolSolicitado = 'Profesor';
    $roleStmt->execute([':nombre_rol' => $rolSolicitado]);
    $role = $roleStmt->fetch();
}

if (!$role) {
    $_SESSION['registro_error'] = 'No se pudo determinar el rol de profesor.';
    header('Location: registro_profesor.php');
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$insertStmt = $pdo->prepare(
    'INSERT INTO usuarios (nombre, apellido, email, password, id_rol, estado, cargo, area, cc, avatar)
     VALUES (:nombre, :apellido, :email, :password, :id_rol, "Inactivo", :cargo, :area, :cc, "img/default-avatar.svg")'
);

$insertStmt->execute([
    ':nombre' => $nombre,
    ':apellido' => $apellido,
    ':email' => $email,
    ':password' => $passwordHash,
    ':id_rol' => $role['id_rol'],
    ':cargo' => $cargo !== '' ? $cargo : null,
    ':area' => $area !== '' ? $area : null,
    ':cc' => $cc !== '' ? $cc : null,
]);

$idNuevoUsuario = (int) $pdo->lastInsertId();
registrarActividad(
    $pdo,
    $idNuevoUsuario,
    'usuario',
    'Registro de profesor',
    'Se registró la solicitud de acceso del profesor ' . $nombre . ' ' . $apellido . '.',
    $idNuevoUsuario,
    'usuarios'
);

$_SESSION['registro_exito'] = 'Su solicitud fue enviada. El Superadministrador debe activarlo para que pueda ingresar.';
header('Location: ../login/index.php');
exit;
