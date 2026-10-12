<?php
session_start();
require_once '../config/conexion.php';
require_once '../config/rbac.php';

$rolActual = currentUserRole();
if (isset($_SESSION['id_usuario']) || isset($_SESSION['usuario_id'])) {
    if ($rolActual === 'Superadministrador') {
        header('Location: ../admin/panel_admin.php');
        exit;
    }

    if ($rolActual === 'Profesor') {
        header('Location: ../dashboard.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#1d4ed8">
    <title>Iniciar sesión</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/estilos.css">
</head>
<body class="auth-page-body">
    <div class="auth-shell">
        <div class="auth-card">
            <div class="auth-brand">
                <img src="../img/logo-institucion.png" alt="Logo de la institución">
            </div>

            <div class="auth-content">
                <p class="eyebrow">Acceso</p>
                <h1>Iniciar sesión</h1>

                <?php if (isset($_SESSION['error_login'])): ?>
                    <div class="form-alert is-error">
                        <?= htmlspecialchars($_SESSION['error_login']); ?>
                    </div>
                    <?php unset($_SESSION['error_login']); ?>
                <?php endif; ?>

                <?php if (isset($_SESSION['registro_exito'])): ?>
                    <div class="form-alert is-success">
                        <?= htmlspecialchars($_SESSION['registro_exito']); ?>
                    </div>
                    <?php unset($_SESSION['registro_exito']); ?>
                <?php endif; ?>

                <form action="procesar.php" method="POST" class="auth-form" data-toast-message="Sesión iniciada correctamente" data-toast-type="success">
                    <label class="field">
                        <span>Correo institucional</span>
                        <input type="email" name="email" class="form-control" placeholder="usuario@institucion.edu.co" required>
                    </label>

                    <label class="field">
                        <span>Contraseña</span>
                        <input type="password" name="password" class="form-control" placeholder="Ingrese su contraseña" required>
                    </label>

                    <button type="submit" class="btn btn-primary btn-block">Entrar</button>
                </form>

                <div class="auth-meta">
                    <span>¿No tienes cuenta?</span>
                    <a href="../usuarios/registro_profesor.php">Registrarse</a>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/main.js"></script>
</body>
</html>
