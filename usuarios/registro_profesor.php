<?php
session_start();

if (isset($_SESSION['id_usuario']) || isset($_SESSION['usuario_id'])) {
    $rolActual = trim((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? ''));
    if ($rolActual === 'Superadministrador') {
        header('Location: ../admin/panel_admin.php');
        exit;
    }

    header('Location: ../dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#1d4ed8">
    <title>Solicitar acceso</title>
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
                <p class="eyebrow">Registro</p>
                <h1>Solicitar acceso</h1>

                <?php if (isset($_SESSION['registro_error'])): ?>
                    <div class="form-alert is-error">
                        <?= htmlspecialchars($_SESSION['registro_error']); ?>
                    </div>
                    <?php unset($_SESSION['registro_error']); ?>
                <?php endif; ?>

                <form action="procesar_registro.php" method="POST" novalidate class="auth-form" data-toast-message="Registro enviado correctamente" data-toast-type="success">
                    <div class="field-row">
                        <label class="field">
                            <span>Nombre</span>
                            <input type="text" class="form-control" name="nombre" required>
                        </label>
                        <label class="field">
                            <span>Apellido</span>
                            <input type="text" class="form-control" name="apellido" required>
                        </label>
                    </div>

                    <div class="field-row">
                        <label class="field">
                            <span>Cargo del profesor</span>
                            <select class="form-select" name="cargo">
                                <option value="">Selecciona</option>
                                <option value="Docente">Docente</option>
                                <option value="Coordinador">Coordinador</option>
                                <option value="Director">Director</option>
                                <option value="Técnico">Técnico</option>
                                <option value="Asistente">Asistente</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </label>
                        <label class="field">
                            <span>Área de docencia</span>
                            <select class="form-select" name="area">
                                <option value="">Selecciona</option>
                                <option value="Informática">Informática</option>
                                <option value="Matemáticas">Matemáticas</option>
                                <option value="Ciencias">Ciencias</option>
                                <option value="Humanidades">Humanidades</option>
                                <option value="Idiomas">Idiomas</option>
                                <option value="Administración">Administración</option>
                                <option value="Artes">Artes</option>
                                <option value="Electrónica">Electrónica</option>
                                <option value="Deportes">Deportes</option>
                                <option value="Otra">Otra</option>
                            </select>
                        </label>
                    </div>

                    <div class="field-row">
                        <label class="field">
                            <span>CC / documento</span>
                            <input type="text" class="form-control" name="cc" placeholder="Opcional">
                        </label>
                        <label class="field">
                            <span>Correo institucional</span>
                            <input type="email" class="form-control" name="email" required>
                        </label>
                    </div>

                    <div class="field-row">
                        <label class="field">
                            <span>Contraseña</span>
                            <input type="password" class="form-control" name="password" required>
                        </label>
                        <label class="field">
                            <span>Confirmar</span>
                            <input type="password" class="form-control" name="confirm_password" required>
                        </label>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Registrarse</button>
                </form>

                <div class="auth-meta">
                    <span>¿Ya tienes cuenta?</span>
                    <a href="../login/index.php">Iniciar sesión</a>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/main.js"></script>
</body>
</html>
