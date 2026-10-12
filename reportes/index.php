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

$usuariosActivos = $pdo->query('SELECT COUNT(*) AS total FROM usuarios WHERE estado = "Activo"')->fetchColumn();
$aulasActivas = $pdo->query('SELECT COUNT(*) AS total FROM aulas WHERE estado = "Activo"')->fetchColumn();
$reservasPendientes = $pdo->query('SELECT COUNT(*) AS total FROM reservas WHERE estado = "Pendiente"')->fetchColumn();
$reservasTotales = $pdo->query('SELECT COUNT(*) AS total FROM reservas')->fetchColumn();
$aprobadas = $pdo->query('SELECT COUNT(*) AS total FROM reservas WHERE estado = "Aprobada"')->fetchColumn();
$rechazadas = $pdo->query('SELECT COUNT(*) AS total FROM reservas WHERE estado = "Rechazada"')->fetchColumn();

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
    <title>Reportes del sistema</title>
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
                <a href="../horarios/cargar_horario.php" class="nav-link"><i class="bi bi-clock-history"></i><span>Horarios</span></a>
                <a href="index.php" class="nav-link is-active"><i class="bi bi-graph-up-arrow"></i><span>Reportes</span></a>
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
                        <h1>Reportes</h1>
                    </div>
                    <div class="header-actions compact-actions">
                        <a href="../admin/panel_admin.php" class="btn btn-secondary btn-compact">Volver</a>
                    </div>
                </div>

                <div class="kpi-grid">
                    <article class="kpi-card neutral">
                        <span>Usuarios activos</span>
                        <strong><?= (int) $usuariosActivos; ?></strong>
                    </article>
                    <article class="kpi-card success">
                        <span>Aulas activas</span>
                        <strong><?= (int) $aulasActivas; ?></strong>
                    </article>
                    <article class="kpi-card warning">
                        <span>Reservas pendientes</span>
                        <strong><?= (int) $reservasPendientes; ?></strong>
                    </article>
                    <article class="kpi-card info">
                        <span>Totales</span>
                        <strong><?= (int) $reservasTotales; ?></strong>
                    </article>
                </div>

                <div class="card shadow mt-3">
                    <div class="card-body">
                        <h2 class="mb-3">Resumen operativo</h2>
                        <div class="row g-4">
                            <div class="col-lg-6">
                                <div class="dashboard-card h-100">
                                    <h5 class="section-title">Totales</h5>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span>Reservas totales</span>
                                            <strong><?= (int) $reservasTotales; ?></strong>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span>Aprobadas</span>
                                            <strong><?= (int) $aprobadas; ?></strong>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <span>Rechazadas</span>
                                            <strong><?= (int) $rechazadas; ?></strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="col-lg-6">
                                <div class="dashboard-card h-100">
                                    <h5 class="section-title">Ajustes</h5>
                                    <div class="empty-state">
                                        <i class="bi bi-bar-chart fs-3 d-block mb-2"></i>
                                        El módulo de reportes está listo para ampliarse con exportaciones PDF/Excel y métricas avanzadas.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <?php require_once '../includes/footer.php'; ?>
</body>
</html>
