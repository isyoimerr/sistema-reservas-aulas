<?php
session_start();

if (!isset($_SESSION['id_usuario']) && !isset($_SESSION['usuario_id'])) {
    header('Location: ../login/index.php');
    exit;
}

require_once __DIR__ . '/../config/rbac.php';
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/logs.php';

$idUsuario = (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? 0);

if ($idUsuario <= 0) {
    $_SESSION['perfil_error'] = 'No se pudo identificar tu perfil.';
    header('Location: ../dashboard.php');
    exit;
}

$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = trim($_POST['email'] ?? '');
$cargo = trim($_POST['cargo'] ?? '');
$area = trim($_POST['area'] ?? '');
$cc = trim($_POST['cc'] ?? '');

if ($nombre === '' || $apellido === '' || $email === '') {
    $_SESSION['perfil_error'] = 'Nombre, apellido y correo son obligatorios.';
    header('Location: ../dashboard.php');
    exit;
}

$checkEmail = $pdo->prepare('SELECT id_usuario FROM usuarios WHERE email = :email AND id_usuario <> :id_usuario LIMIT 1');
$checkEmail->execute([':email' => $email, ':id_usuario' => $idUsuario]);
if ($checkEmail->fetch()) {
    $_SESSION['perfil_error'] = 'Ya existe otro usuario con ese correo.';
    header('Location: ../dashboard.php');
    exit;
}

$avatarPath = null;
if (isset($_FILES['avatar']) && is_array($_FILES['avatar']) && !empty($_FILES['avatar']['name'])) {
    $file = $_FILES['avatar'];

    if ($file['error'] !== UPLOAD_ERR_OK || empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        $_SESSION['perfil_error'] = 'La imagen no se pudo subir correctamente.';
        header('Location: ' . (normalizeRole(currentUserRole()) === 'Superadministrador' ? '../admin/perfil.php' : '../dashboard.php'));
        exit;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $isRealImage = @getimagesize($file['tmp_name']) !== false;

    if ((!in_array($mimeType, $allowedMimeTypes, true) && !in_array($extension, $allowedExtensions, true)) || !$isRealImage) {
        $_SESSION['perfil_error'] = 'El archivo debe ser una imagen válida (JPG, PNG, WEBP o GIF).';
        header('Location: ' . (normalizeRole(currentUserRole()) === 'Superadministrador' ? '../admin/perfil.php' : '../dashboard.php'));
        exit;
    }

    $safeName = 'avatar_' . $idUsuario . '_' . time() . '.' . $extension;
    $targetDir = __DIR__ . '/../uploads/avatars';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $targetPath = $targetDir . '/' . $safeName;
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        $_SESSION['perfil_error'] = 'No se pudo guardar la imagen de perfil.';
        header('Location: ' . (normalizeRole(currentUserRole()) === 'Superadministrador' ? '../admin/perfil.php' : '../dashboard.php'));
        exit;
    }

    $avatarPath = 'uploads/avatars/' . $safeName;
}

$updateSql = 'UPDATE usuarios SET nombre = :nombre, apellido = :apellido, email = :email, cargo = :cargo, area = :area, cc = :cc';
$params = [
    ':nombre' => $nombre,
    ':apellido' => $apellido,
    ':email' => $email,
    ':cargo' => $cargo !== '' ? $cargo : null,
    ':area' => $area !== '' ? $area : null,
    ':cc' => $cc !== '' ? $cc : null,
];

if ($avatarPath !== null) {
    $updateSql .= ', avatar = :avatar';
    $params[':avatar'] = $avatarPath;
}

$updateSql .= ' WHERE id_usuario = :id_usuario';
$params[':id_usuario'] = $idUsuario;

$stmt = $pdo->prepare($updateSql);
$stmt->execute($params);

$_SESSION['nombre'] = $nombre . ' ' . $apellido;
$_SESSION['usuario_nombre'] = $_SESSION['nombre'];
$_SESSION['usuario_email'] = $email;
$_SESSION['perfil_exito'] = 'Perfil actualizado correctamente.';

registrarActividad($pdo, $idUsuario, 'perfil', 'Actualización de perfil', 'Se actualizó la información del perfil del usuario.', $idUsuario, 'perfil');

$redirectTarget = normalizeRole(currentUserRole()) === 'Superadministrador' ? '../admin/perfil.php' : '../dashboard.php';
header('Location: ' . $redirectTarget);
exit;
