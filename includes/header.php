<?php
$currentPage = basename($_SERVER['PHP_SELF'] ?? '');
$scriptPath = $_SERVER['PHP_SELF'] ?? '';
$internalPagePaths = ['/admin/', '/aulas/', '/reservas/', '/horarios/', '/reportes/', '/usuarios/', '/login/'];
$dashboardPageNames = ['dashboard.php', 'panel_admin.php', 'gestionar_usuarios.php', 'gestionar_aula.php', 'perfil.php'];
$authPageNames = ['index.php', 'registro_profesor.php'];

$shouldSkipPublicHeader = in_array($currentPage, $dashboardPageNames, true)
    || in_array($currentPage, $authPageNames, true)
    || array_reduce($internalPagePaths, fn($carry, $path) => $carry || str_contains($scriptPath, $path), false);

if ($shouldSkipPublicHeader) {
    return;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#1d4ed8">
    <title>Institución Educativa Técnica José Agustín Blanco Barros</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/estilos.css">
</head>
<body>
    <?php
        $rolActual = null;
        if (function_exists('currentUserRole')) {
            $rolActual = trim((string) currentUserRole());
        } elseif (isset($_SESSION['rol']) || isset($_SESSION['usuario_rol'])) {
            $rolActual = trim((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? ''));
        }

        $rbacAlert = $_SESSION['rbac_error'] ?? null;
        $rbacSuccess = $_SESSION['rbac_success'] ?? null;
        unset($_SESSION['rbac_error'], $_SESSION['rbac_success']);
    ?>
    <?php if ($rbacAlert): ?>
        <div class="rbac-banner is-error"><?= htmlspecialchars($rbacAlert); ?></div>
    <?php elseif ($rbacSuccess): ?>
        <div class="rbac-banner is-success"><?= htmlspecialchars($rbacSuccess); ?></div>
    <?php endif; ?>
    <div class="system-banner" aria-live="polite" role="status">Sin conexión. Reintentando…</div>

    <header class="app-header inner-header">
        <div class="container">
            <div class="topbar">
                <a class="brand" href="../index.php" aria-label="Inicio institucional">
                    <img src="../img/logo-institucion.png" alt="Logo de la institución" class="brand-logo">
                    <span class="brand-text">ITEJABB</span>
                </a>

                <div class="header-actions">
                    <?php if (isset($_SESSION['id_usuario']) || isset($_SESSION['usuario_id'])): ?>
                        <span class="user-pill">
                            <?= htmlspecialchars($_SESSION['nombre'] ?? $_SESSION['usuario_nombre'] ?? 'Usuario') ?>
                        </span>
                        <a class="btn btn-ghost btn-compact" href="../login/logout.php">Salir</a>
                    <?php else: ?>
                        <a class="btn btn-ghost btn-compact" href="../login/index.php">Iniciar sesión</a>
                        <a class="btn btn-primary btn-compact" href="../usuarios/registro_profesor.php">Registro</a>
                    <?php endif; ?>
                </div>
                <button class="mobile-menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </header>

    <aside class="mobile-drawer" aria-label="Menú lateral">
        <div class="drawer-backdrop"></div>
        <div class="drawer-panel">
            <div class="drawer-header">
                <a class="brand" href="../index.php" aria-label="Inicio institucional">
                    <img src="../img/logo-institucion.png" alt="Logo de la institución" class="brand-logo">
                    <span class="brand-text">ITEJABB</span>
                </a>
                <button class="drawer-close" type="button" aria-label="Cerrar menú"><i class="bi bi-x-lg"></i></button>
            </div>
            <nav class="drawer-nav" aria-label="Menú móvil">
                <a href="../index.php">Inicio</a>
                <?php if (isset($_SESSION['id_usuario']) || isset($_SESSION['usuario_id'])): ?>
                    <a href="../dashboard.php">Panel</a>
                    <a href="../aulas/gestionar_aula.php">Aulas</a>
                    <a href="../reservas/consultar.php">Reservas</a>
                    <a href="../reservas/mis_reservas.php">Mis reservas</a>
                    <a href="../reservas/crear_reserva.php">Nueva reserva</a>
                    <a href="../horarios/cargar_horario.php">Horarios</a>
                    <?php if ($rolActual && normalizeRole($rolActual) === 'Superadministrador'): ?>
                        <a href="../admin/gestionar_usuarios.php">Usuarios</a>
                        <a href="../reportes/index.php">Reportes</a>
                    <?php endif; ?>
                <?php endif; ?>
            </nav>
            <div class="drawer-actions">
                <?php if (isset($_SESSION['id_usuario']) || isset($_SESSION['usuario_id'])): ?>
                    <a class="btn btn-ghost" href="../login/logout.php">Salir</a>
                <?php else: ?>
                    <a class="btn btn-ghost" href="../login/index.php">Iniciar sesión</a>
                    <a class="btn btn-primary" href="../usuarios/registro_profesor.php">Registro</a>
                <?php endif; ?>
            </div>
        </div>
    </aside>
    <main class="container app-main">
