<?php
session_start();
require_once __DIR__ . '/config/rbac.php';
require_once __DIR__ . '/config/conexion.php';
require_once __DIR__ . '/config/logs.php';

if (!isset($_SESSION['id_usuario']) && !isset($_SESSION['usuario_id'])) {
    header('Location: login/index.php');
    exit;
}

$rolActual = currentUserRole();
$idUsuario = (int) ($_SESSION['id_usuario'] ?? $_SESSION['usuario_id'] ?? 0);
$esAdmin = normalizeRole($rolActual) === 'Superadministrador';
$logins = obtenerActividadPorTipo($pdo, 'login', $esAdmin ? null : $idUsuario, 20);

$usuarioSesion = $_SESSION['nombre'] ?? ($_SESSION['usuario_nombre'] ?? 'Usuario');
$avatarSesion = 'img/default-avatar.svg';
$menuItems = $esAdmin ? [
    ['icon' => 'bi-house-door', 'label' => 'Inicio', 'href' => 'dashboard.php', 'active' => false],
    ['icon' => 'bi-calendar3', 'label' => 'Reservas', 'href' => 'reservas/consultar.php', 'active' => false],
    ['icon' => 'bi-building', 'label' => 'Aulas', 'href' => 'aulas/gestionar_aula.php', 'active' => false],
    ['icon' => 'bi-clock-history', 'label' => 'Horarios', 'href' => 'horarios/cargar_horario.php', 'active' => false],
    ['icon' => 'bi-people', 'label' => 'Usuarios', 'href' => 'admin/gestionar_usuarios.php', 'active' => false],
    ['icon' => 'bi-graph-up-arrow', 'label' => 'Reportes', 'href' => 'reportes/index.php', 'active' => false],
    ['icon' => 'bi-gear', 'label' => 'Perfil', 'href' => ($esAdmin ? 'admin/perfil.php' : '#perfil'), 'active' => false],
    ['icon' => 'bi-shield-lock', 'label' => 'Actividad de login', 'href' => 'actividad_login.php', 'active' => true],
] : [
    ['icon' => 'bi-house-door', 'label' => 'Inicio', 'href' => 'dashboard.php', 'active' => false],
    ['icon' => 'bi-calendar3', 'label' => 'Mis reservas', 'href' => 'reservas/mis_reservas.php', 'active' => false],
    ['icon' => 'bi-building', 'label' => 'Aulas', 'href' => 'aulas/gestionar_aula.php', 'active' => false],
    ['icon' => 'bi-clock-history', 'label' => 'Horarios', 'href' => 'horarios/cargar_horario.php', 'active' => false],
    ['icon' => 'bi-gear', 'label' => 'Perfil', 'href' => '#perfil', 'active' => false],
    ['icon' => 'bi-shield-lock', 'label' => 'Actividad de login', 'href' => 'actividad_login.php', 'active' => true],
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Actividad de login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/estilos.css">
</head>
<body class="dashboard-body">
    <button type="button" class="mobile-sidebar-toggle" id="mobileSidebarToggle" aria-label="Abrir menú" aria-expanded="false">
        <i class="bi bi-list"></i>
    </button>

    <div class="dashboard-shell">
        <aside class="dashboard-sidebar" id="sidebarMenu" aria-label="Menú principal" aria-expanded="true">
            <div class="sidebar-header-row">
                <div class="sidebar-brand">
                    <img src="img/logo-institucion.png" alt="Logo institucional">
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
                    <p><?= htmlspecialchars($esAdmin ? 'Administrador' : 'Profesor'); ?></p>
                </div>
            </div>

            <nav class="dashboard-nav" aria-label="Navegación principal">
                <?php foreach ($menuItems as $item): ?>
                    <a href="<?= htmlspecialchars($item['href'], ENT_QUOTES, 'UTF-8'); ?>" class="nav-link <?= $item['active'] ? 'is-active' : ''; ?>">
                        <i class="bi <?= $item['icon']; ?>"></i>
                        <span><?= htmlspecialchars($item['label']); ?></span>
                    </a>
                <?php endforeach; ?>
            </nav>

            <div class="sidebar-footer">
                <a href="login/logout.php" class="logout-button">
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
                        <input type="search" placeholder="Buscar accesos..." aria-label="Buscar en actividad de login">
                    </div>
                </div>
                <div class="topbar-actions">
                    <button type="button" class="icon-button" aria-label="Notificaciones">
                        <i class="bi bi-bell"></i>
                    </button>
                    <button type="button" class="icon-button" aria-label="Mensajes">
                        <i class="bi bi-chat-left-text"></i>
                    </button>
                </div>
            </header>

            <section class="hero-dashboard">
                <div>
                    <p class="eyebrow">Seguridad</p>
                    <h1>Actividad de login</h1>
                </div>
                <div class="hero-pill">
                    <span class="status-dot"></span>
                    <?= $esAdmin ? 'Historial completo' : 'Mi historial'; ?>
                </div>
            </section>

            <section class="panel-card">
                <div class="panel-header">
                    <h2><?= $esAdmin ? 'Accesos del sistema' : 'Mis accesos'; ?></h2>
                </div>
                <div class="summary-list">
                    <?php if (empty($logins)): ?>
                        <div class="summary-item">
                            <span class="item-icon"><i class="bi bi-info-circle"></i></span>
                            <div>
                                <strong>No hay accesos registrados</strong>
                                <small>Los inicios y cierres de sesión aparecerán aquí.</small>
                            </div>
                        </div>
                    <?php else: ?>
                        <?php foreach ($logins as $login): ?>
                            <div class="summary-item">
                                <span class="item-icon"><i class="bi bi-shield-lock"></i></span>
                                <div>
                                    <strong><?= htmlspecialchars(($esAdmin ? $login['nombre_usuario'] . ' · ' : '') . $login['accion']); ?></strong>
                                    <small><?= htmlspecialchars($login['descripcion']); ?> · <?= htmlspecialchars(date('d/m/Y H:i', strtotime((string) $login['fecha_registro']))); ?></small>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </section>
        </main>
    </div>

    <script src="js/main.js"></script>
</body>
</html>
