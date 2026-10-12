<?php
session_start();
require_once '../config/rbac.php';
require_once '../config/logs.php';

$rolActual = currentUserRole();
if (!isset($_SESSION['id_usuario']) && !isset($_SESSION['usuario_id'])) {
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

require_once '../config/conexion.php';
$usuariosActivos = $pdo->query('SELECT COUNT(*) FROM usuarios WHERE estado = "Activo"')->fetchColumn();
$aulasRegistradas = $pdo->query('SELECT COUNT(*) FROM aulas')->fetchColumn();
$reservasPendientes = $pdo->query('SELECT COUNT(*) FROM reservas WHERE estado = "Pendiente"')->fetchColumn();

$usuarioSesion = $_SESSION['nombre'] ?? ($_SESSION['usuario_nombre'] ?? 'Usuario');
$rolSesion = normalizeRole((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? 'Superadministrador'));
$avatarSesion = '../img/default-avatar.svg';
$actividadLogin = obtenerActividadPorTipo($pdo, 'login', null, 8);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Panel administrativo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/estilos.css">
</head>
<body class="dashboard-body">
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
                <a href="gestionar_usuarios.php" class="nav-link"><i class="bi bi-people"></i><span>Usuarios</span></a>
                <a href="../aulas/gestionar_aula.php" class="nav-link"><i class="bi bi-building"></i><span>Aulas</span></a>
                <a href="../reservas/consultar.php" class="nav-link"><i class="bi bi-calendar3"></i><span>Reservas</span></a>
                <a href="../horarios/cargar_horario.php" class="nav-link"><i class="bi bi-clock-history"></i><span>Horarios</span></a>
                <a href="../reportes/index.php" class="nav-link"><i class="bi bi-bar-chart"></i><span>Reportes</span></a>
                <a href="perfil.php" class="nav-link"><i class="bi bi-person-circle"></i><span>Perfil</span></a>
                <a href="../actividad_login.php" class="nav-link"><i class="bi bi-shield-lock"></i><span>Actividad de login</span></a>
            </nav>

            <div class="sidebar-footer">
                <a href="../login/logout.php" class="logout-button">
                    <i class="bi bi-box-arrow-right"></i>
                    Cerrar sesión
                </a>
            </div>
        </aside>

        <main class="dashboard-main" id="main-content">
            <header class="dashboard-topbar">
                <div class="topbar-left">
                    <div class="search-box" role="search">
                        <i class="bi bi-search"></i>
                        <input type="search" placeholder="Buscar usuarios, reservas, aulas..." aria-label="Buscar dentro del panel">
                    </div>
                </div>

                <div class="topbar-actions">
                    <button type="button" class="icon-button" data-panel="notifications" aria-label="Notificaciones">
                        <i class="bi bi-bell"></i>
                        <span class="panel-badge">3</span>
                    </button>
                    <button type="button" class="icon-button" data-panel="messages" aria-label="Mensajes">
                        <i class="bi bi-chat-left-text"></i>
                        <span class="panel-badge">2</span>
                    </button>
                </div>
            </header>

            <aside class="utility-panel" id="utilityPanel" aria-hidden="true">
                <div class="utility-panel-header">
                    <h3 id="utilityPanelTitle">Notificaciones</h3>
                    <button type="button" class="utility-panel-close" aria-label="Cerrar panel">Cerrar</button>
                </div>
                <div class="utility-panel-body" id="utilityPanelBody"></div>
            </aside>

            <section class="hero-dashboard">
                <div>
                    <p class="eyebrow">Administración</p>
                    <h1>Panel central</h1>
                </div>
                <div class="hero-pill">
                    <span class="status-dot"></span>
                    Sistema activo
                </div>
            </section>

            <section class="stats-grid">
                <article class="stat-card primary">
                    <span>Usuarios activos</span>
                    <strong><?= (int) $usuariosActivos; ?></strong>
                </article>
                <article class="stat-card accent">
                    <span>Aulas registradas</span>
                    <strong><?= (int) $aulasRegistradas; ?></strong>
                </article>
                <article class="stat-card soft">
                    <span>Reservas pendientes</span>
                    <strong><?= (int) $reservasPendientes; ?></strong>
                </article>
                <article class="stat-card neutral">
                    <span>Estado</span>
                    <strong>Estable</strong>
                </article>
            </section>

            <section class="content-grid">
                <article class="panel-card searchable-item" data-search-key="acciones usuarios aulas reservas horarios reportes">
                    <div class="panel-header">
                        <h2>Acciones rápidas</h2>
                    </div>

                    <div class="quick-list">
                        <a href="gestionar_usuarios.php" class="mini-action"><i class="bi bi-people"></i><span>Usuarios</span></a>
                        <a href="../aulas/gestionar_aula.php" class="mini-action"><i class="bi bi-building"></i><span>Aulas</span></a>
                        <a href="../reservas/consultar.php" class="mini-action"><i class="bi bi-calendar3"></i><span>Reservas</span></a>
                        <a href="../horarios/cargar_horario.php" class="mini-action"><i class="bi bi-clock-history"></i><span>Horarios</span></a>
                        <a href="../reportes/index.php" class="mini-action"><i class="bi bi-bar-chart"></i><span>Reportes</span></a>
                    </div>
                </article>

                <article class="panel-card searchable-item" data-search-key="resumen gestion usuarios aulas reservas">
                    <div class="panel-header">
                        <h2>Resumen</h2>
                    </div>

                    <div class="summary-list">
                        <div class="summary-item searchable-item" data-search-key="gestión usuarios alta activación permisos">
                            <span class="item-icon"><i class="bi bi-people"></i></span>
                            <div>
                                <strong>Gestión de usuarios</strong>
                                <small>Alta, activación y permisos.</small>
                            </div>
                        </div>
                        <div class="summary-item searchable-item" data-search-key="control aulas disponibilidad mantenimiento">
                            <span class="item-icon"><i class="bi bi-building"></i></span>
                            <div>
                                <strong>Control de aulas</strong>
                                <small>Disponibilidad y mantenimiento.</small>
                            </div>
                        </div>
                        <div class="summary-item searchable-item" data-search-key="reservas revisión aprobación seguimiento">
                            <span class="item-icon"><i class="bi bi-calendar3"></i></span>
                            <div>
                                <strong>Reservas</strong>
                                <small>Revisión, aprobación y seguimiento.</small>
                            </div>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    </div>

    <script src="../js/main.js"></script>
</body>
</html>
