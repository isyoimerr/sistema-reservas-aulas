<?php
session_start();
require_once '../config/rbac.php';
require_once '../config/conexion.php';

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

$usuariosStmt = $pdo->query(
    'SELECT u.id_usuario, u.nombre, u.apellido, u.estado
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     WHERE r.nombre_rol = "Profesor" AND u.estado = "Activo"
     ORDER BY u.apellido, u.nombre'
);
$profesores = $usuariosStmt->fetchAll();

$aulasStmt = $pdo->query(
    'SELECT id_aula, codigo_aula, nombre_aula, estado
     FROM aulas
     WHERE estado IN ("Activo", "Mantenimiento")
     ORDER BY nombre_aula'
);
$aulas = $aulasStmt->fetchAll();

$usuarioSesion = $_SESSION['nombre'] ?? ($_SESSION['usuario_nombre'] ?? 'Usuario');
$rolSesion = normalizeRole((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? 'Superadministrador'));
$avatarSesion = '../img/default-avatar.svg';
$rbacAlert = $_SESSION['rbac_error'] ?? null;
unset($_SESSION['rbac_error']);
$rbacSuccess = $_SESSION['rbac_success'] ?? null;
unset($_SESSION['rbac_success']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Horarios</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/estilos.css">
</head>
<body class="dashboard-body">
    <?php if ($rbacAlert): ?>
        <div class="rbac-banner is-error"><?= htmlspecialchars($rbacAlert); ?></div>
    <?php elseif ($rbacSuccess): ?>
        <div class="rbac-banner is-success"><?= htmlspecialchars($rbacSuccess); ?></div>
    <?php endif; ?>

    <button type="button" class="mobile-sidebar-toggle" id="mobileSidebarToggle" aria-label="Abrir menú" aria-expanded="false">
        <i class="bi bi-list"></i>
    </button>

    <div class="dashboard-shell">
        <aside class="dashboard-sidebar" id="sidebarMenu" aria-label="Menú principal" aria-expanded="true">
            <div class="sidebar-header-row">
                <div class="sidebar-brand">
                    <img src="../img/logo-institucion.png" alt="Logo institucional">
                    <div>
                        <strong>ITEJABB</strong>
                        <span>Campus</span>
                    </div>
                </div>
                <button type="button" class="sidebar-collapse-button" id="sidebarToggle" aria-label="Ocultar menú" aria-expanded="true">
                    <i class="bi bi-chevron-left"></i>
                </button>
            </div>

            <div class="profile-summary">
                <div class="profile-avatar">
                    <img src="<?= htmlspecialchars($avatarSesion, ENT_QUOTES, 'UTF-8'); ?>" alt="Foto de perfil">
                </div>
                <div>
                    <h3><?= htmlspecialchars($usuarioSesion); ?></h3>
                    <p><?= htmlspecialchars($rolSesion === 'Superadministrador' ? 'Administrador' : 'Profesor'); ?></p>
                </div>
            </div>

            <nav class="dashboard-nav" aria-label="Navegación principal">
                <a href="../dashboard.php" class="nav-link"><i class="bi bi-house-door"></i><span>Inicio</span></a>
                <a href="../admin/gestionar_usuarios.php" class="nav-link"><i class="bi bi-people"></i><span>Usuarios</span></a>
                <a href="../aulas/gestionar_aula.php" class="nav-link"><i class="bi bi-building"></i><span>Aulas</span></a>
                <a href="../reservas/consultar.php" class="nav-link"><i class="bi bi-calendar3"></i><span>Reservas</span></a>
                <a href="cargar_horario.php" class="nav-link is-active"><i class="bi bi-clock-history"></i><span>Horarios</span></a>
                <a href="../reportes/index.php" class="nav-link"><i class="bi bi-graph-up-arrow"></i><span>Reportes</span></a>
                <a href="../admin/perfil.php" class="nav-link"><i class="bi bi-person-circle"></i><span>Perfil</span></a>
            </nav>

            <div class="sidebar-footer">
                <a href="../login/logout.php" class="logout-button"><i class="bi bi-box-arrow-right"></i> Cerrar sesión</a>
            </div>
        </aside>

        <main class="dashboard-main" id="main-content">
            <div class="page-shell">
                <div class="page-header">
                    <div>
                        <p class="eyebrow">Administración</p>
                        <h1>Horarios</h1>
                    </div>
                    <div class="header-actions compact-actions">
                        <a href="../admin/panel_admin.php" class="btn btn-secondary btn-compact">Volver</a>
                    </div>
                </div>

                <div class="card shadow">
                    <div class="card-body">
                        <h2 class="mb-3">Cargar horario docente</h2>

                        <?php if (isset($_SESSION['mensaje_horario'])): ?>
                            <div class="alert alert-success">
                                <?= htmlspecialchars($_SESSION['mensaje_horario']); ?>
                            </div>
                            <?php unset($_SESSION['mensaje_horario']); ?>
                        <?php endif; ?>

                        <form action="procesar_horario.php" method="POST" class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label">Profesor</label>
                                <select name="id_usuario" class="form-select" required>
                                    <option value="">Seleccione</option>
                                    <?php foreach ($profesores as $profesor): ?>
                                        <option value="<?= (int) $profesor['id_usuario']; ?>">
                                            <?= htmlspecialchars($profesor['nombre'] . ' ' . $profesor['apellido']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="col-md-4">
                                <label class="form-label">Aula</label>
                                <select name="id_aula" class="form-select" required>
                                    <option value="">Seleccione</option>
                                    <?php foreach ($aulas as $aula): ?>
                                        <option value="<?= (int) $aula['id_aula']; ?>">
                                            <?= htmlspecialchars($aula['codigo_aula'] . ' - ' . $aula['nombre_aula']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="col-md-4">
                                <label class="form-label">Día</label>
                                <select name="dia_semana" class="form-select" required>
                                    <option value="">Seleccione</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                    <option value="Sábado">Sábado</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Hora inicio</label>
                                <input type="time" class="form-control" name="hora_inicio" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Hora fin</label>
                                <input type="time" class="form-control" name="hora_fin" required>
                            </div>

                            <div class="col-12 d-flex gap-2 flex-wrap">
                                <button type="submit" class="btn btn-primary">Guardar horario</button>
                                <a href="../admin/panel_admin.php" class="btn btn-outline-secondary">Volver</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <?php require_once '../includes/footer.php'; ?>
</body>
</html>
