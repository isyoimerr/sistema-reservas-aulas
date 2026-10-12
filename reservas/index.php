<?php
session_start();

if (!isset($_SESSION['id_usuario']) && !isset($_SESSION['usuario_id'])) {
    session_unset();
    session_destroy();
    header('Location: ../login/index.php');
    exit;
}

require_once '../config/rbac.php';
$rolActual = currentUserRole();
header('Location: ' . ($rolActual === 'Superadministrador' ? '../admin/panel_admin.php' : '../dashboard.php'));
exit;
