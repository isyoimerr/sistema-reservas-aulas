<?php
session_start();
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/rbac.php';
require_once __DIR__ . '/../config/logs.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($email === '' || $password === '') {
    $_SESSION['error_login'] = 'Debe ingresar correo y contraseña.';
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare(
    'SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.password, u.estado, r.nombre_rol
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.email = :email
     LIMIT 1'
);
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if ($user && $user['estado'] === 'Activo' && password_verify($password, $user['password'])) {
    $rol = normalizeRole((string) ($user['nombre_rol'] ?? ''));

    $_SESSION['id_usuario'] = (int) $user['id_usuario'];
    $_SESSION['usuario_id'] = (int) $user['id_usuario'];
    $_SESSION['nombre'] = trim((string) $user['nombre']) . ' ' . trim((string) $user['apellido']);
    $_SESSION['usuario_nombre'] = $_SESSION['nombre'];
    $_SESSION['rol'] = $rol;
    $_SESSION['usuario_rol'] = $rol;
    $_SESSION['usuario_email'] = $user['email'];

    registrarActividad($pdo, (int) $user['id_usuario'], 'login', 'Inicio de sesión', 'El usuario inició sesión en el sistema.');

    if ($rol === 'Superadministrador') {
        header('Location: ../admin/panel_admin.php');
        exit;
    }

    header('Location: ../dashboard.php');
    exit;
}

$_SESSION['error_login'] = 'Credenciales incorrectas o usuario inactivo.';
header('Location: index.php');
exit;
