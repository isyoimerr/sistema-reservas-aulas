<?php
session_start();
require_once '../config/rbac.php';
require_once '../config/conexion.php';

requireAuth('../login/index.php');
$rolActual = currentUserRole();
$isAdmin = normalizeRole($rolActual) === 'Superadministrador';

if (!$isAdmin && normalizeRole($rolActual) !== 'Profesor') {
    http_response_code(403);
    $_SESSION['rbac_error'] = 'No tienes permisos para acceder a esta sección.';
    header('Location: ../dashboard.php?error=403');
    exit;
}

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
    <title>Gestión de aulas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/estilos.css">
</head>
<body class="dashboard-body">
    <button type="button" class="mobile-sidebar-toggle" id="mobileSidebarToggle" aria-label="Abrir menú" aria-expanded="false">
        <i class="bi bi-list"></i>
    </button>

<?php if ($rbacAlert): ?>
    <div class="rbac-banner is-error"><?= htmlspecialchars($rbacAlert); ?></div>
<?php elseif ($rbacSuccess): ?>
    <div class="rbac-banner is-success"><?= htmlspecialchars($rbacSuccess); ?></div>
<?php endif; ?>

<?php
$stmt = $pdo->query('SELECT * FROM aulas ORDER BY estado ASC, nombre_aula ASC');
$aulas = $stmt->fetchAll();
$usuarioSesion = $_SESSION['nombre'] ?? ($_SESSION['usuario_nombre'] ?? 'Usuario');
$rolSesion = normalizeRole((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? 'Profesor'));
$avatarSesion = 'img/default-avatar.svg';
?>

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
            <a href="../reservas/consultar.php" class="nav-link"><i class="bi bi-calendar3"></i><span>Reservas</span></a>
            <a href="gestionar_aula.php" class="nav-link is-active"><i class="bi bi-building"></i><span>Aulas</span></a>
            <a href="../horarios/cargar_horario.php" class="nav-link"><i class="bi bi-clock-history"></i><span>Horarios</span></a>
            <?php if ($isAdmin): ?>
                <a href="../admin/gestionar_usuarios.php" class="nav-link"><i class="bi bi-people"></i><span>Usuarios</span></a>
                <a href="../reportes/index.php" class="nav-link"><i class="bi bi-graph-up-arrow"></i><span>Reportes</span></a>
            <?php endif; ?>
            <a href="#perfil" class="nav-link"><i class="bi bi-gear"></i><span>Perfil</span></a>
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
                    <h1>Aulas</h1>
                </div>
                <div class="header-actions compact-actions">
                    <a href="<?= $isAdmin ? '../admin/panel_admin.php' : '../dashboard.php'; ?>" class="btn btn-secondary btn-compact">Volver</a>
                    <?php if ($isAdmin): ?>
                        <button type="button" class="btn btn-primary btn-compact">[ + Añadir Registro ]</button>
                    <?php else: ?>
                        <button type="button" class="btn btn-outline-secondary btn-compact" disabled>Solo lectura</button>
                    <?php endif; ?>
                </div>
            </div>

            <div class="kpi-grid">
                <article class="kpi-card neutral">
                    <span>Aulas</span>
                    <strong><?= count($aulas); ?></strong>
                </article>
                <article class="kpi-card success">
                    <span>Disponibles</span>
                    <strong><?= count(array_filter($aulas, fn($aula) => strtolower((string)$aula['estado']) === 'activo')); ?></strong>
                </article>
                <article class="kpi-card warning">
                    <span>Mantenimiento</span>
                    <strong><?= count(array_filter($aulas, fn($aula) => strtolower((string)$aula['estado']) === 'mantenimiento')); ?></strong>
                </article>
                <article class="kpi-card info">
                    <span>Estado</span>
                    <strong>Operativo</strong>
                </article>
            </div>

            <div class="filter-bar">
                <div class="filter-pill">Todas</div>
                <div class="filter-pill">Disponibles</div>
                <div class="filter-pill">Ocupadas</div>
                <div class="filter-pill">Mantenimiento</div>
            </div>

            <div class="data-block">
                <?php if (empty($aulas)): ?>
                    <div class="empty-state">
                        <p>0 registros coincidentes.</p>
                        <?php if ($isAdmin): ?>
                            <button type="button" class="btn btn-primary btn-compact">[ + Añadir Registro ]</button>
                        <?php else: ?>
                            <button type="button" class="btn btn-outline-secondary btn-compact" disabled>Consulta solo lectura</button>
                        <?php endif; ?>
                    </div>
                <?php else: ?>
                    <div class="table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Aula</th>
                                    <th>Capacidad</th>
                                    <th>Estado</th>
                                    <th>Equipamiento</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($aulas as $aula): ?>
                                    <tr data-detail-target data-title="<?= htmlspecialchars($aula['nombre_aula'] ?? 'Aula'); ?>" data-code="<?= htmlspecialchars($aula['codigo_aula'] ?? 'N/A'); ?>" data-capacity="<?= (int)($aula['capacidad'] ?? 0); ?>" data-status="<?= htmlspecialchars($aula['estado'] ?? 'Activo'); ?>" data-equipment="<?= htmlspecialchars($aula['equipamiento'] ?? 'Sin especificar'); ?>">
                                        <td><?= htmlspecialchars($aula['codigo_aula'] ?? 'N/A'); ?></td>
                                        <td><?= htmlspecialchars($aula['nombre_aula'] ?? 'Sin nombre'); ?></td>
                                        <td><?= (int)($aula['capacidad'] ?? 0); ?></td>
                                        <td><span class="status-badge status-<?= strtolower(str_replace(' ', '-', (string)($aula['estado'] ?? 'activo'))); ?>"><?= htmlspecialchars($aula['estado'] ?? 'Activo'); ?></span></td>
                                        <td><?= htmlspecialchars($aula['equipamiento'] ?? 'Sin especificar'); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <aside class="detail-panel" aria-label="Detalle del registro">
            <div class="detail-panel-header">
                <div>
                    <p>Detalle</p>
                    <h3 id="detailTitle">Aula</h3>
                </div>
                <button type="button" class="panel-close" data-close-panel aria-label="Cerrar panel">×</button>
            </div>

            <dl class="detail-list">
                <div>
                    <dt>Código</dt>
                    <dd id="detailCode">-</dd>
                </div>
                <div>
                    <dt>Capacidad</dt>
                    <dd id="detailCapacity">-</dd>
                </div>
                <div>
                    <dt>Estado</dt>
                    <dd id="detailStatus">-</dd>
                </div>
                <div>
                    <dt>Equipamiento</dt>
                    <dd id="detailEquipment">-</dd>
                </div>
            </dl>

            <div class="detail-panel-actions">
                <?php if ($isAdmin): ?>
                    <button type="button" class="btn btn-primary btn-block">Aprobar</button>
                    <button type="button" class="btn btn-secondary btn-block">Rechazar</button>
                <?php else: ?>
                    <button type="button" class="btn btn-outline-secondary btn-block" disabled>Sin permisos de escritura</button>
                <?php endif; ?>
            </div>
        </aside>
    </main>
</div>

<?php require_once '../includes/footer.php'; ?>
