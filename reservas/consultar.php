<?php
session_start();
require_once '../config/rbac.php';
require_once '../config/conexion.php';

requireAuth('../login/index.php');
requireRole(['Superadministrador'], '../login/index.php?error=403', 'No tienes permisos para consultar reservas del sistema.');

$solicitudes = [
    [
        'id' => 'R-1042',
        'docente' => 'Ana García',
        'aula' => 'A-203',
        'fecha' => '12/10/2026',
        'horario' => '08:00 - 10:00',
        'estado' => 'Pendiente',
        'motivo' => 'Clase de matemáticas'
    ],
    [
        'id' => 'R-1047',
        'docente' => 'Carlos Ruiz',
        'aula' => 'B-110',
        'fecha' => '12/10/2026',
        'horario' => '10:30 - 12:00',
        'estado' => 'Aprobada',
        'motivo' => 'Laboratorio de física'
    ],
    [
        'id' => 'R-1051',
        'docente' => 'Luisa Torres',
        'aula' => 'C-302',
        'fecha' => '13/10/2026',
        'horario' => '14:00 - 16:00',
        'estado' => 'Rechazada',
        'motivo' => 'Reunión de coordinación'
    ]
];

$rbacAlert = $_SESSION['rbac_error'] ?? null;
unset($_SESSION['rbac_error']);
$rbacSuccess = $_SESSION['rbac_success'] ?? null;
unset($_SESSION['rbac_success']);
$usuarioSesion = $_SESSION['nombre'] ?? ($_SESSION['usuario_nombre'] ?? 'Usuario');
$rolSesion = normalizeRole((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? 'Superadministrador'));
$avatarSesion = '../img/default-avatar.svg';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Consulta de reservas</title>
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
                <a href="consultar.php" class="nav-link is-active"><i class="bi bi-calendar3"></i><span>Reservas</span></a>
                <a href="../aulas/gestionar_aula.php" class="nav-link"><i class="bi bi-building"></i><span>Aulas</span></a>
                <a href="../horarios/cargar_horario.php" class="nav-link"><i class="bi bi-clock-history"></i><span>Horarios</span></a>
                <a href="../admin/gestionar_usuarios.php" class="nav-link"><i class="bi bi-people"></i><span>Usuarios</span></a>
                <a href="../reportes/index.php" class="nav-link"><i class="bi bi-graph-up-arrow"></i><span>Reportes</span></a>
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
                        <p class="eyebrow">Reservas</p>
                        <h1>Control</h1>
                    </div>
                    <div class="header-actions compact-actions">
                        <a href="../admin/panel_admin.php" class="btn btn-secondary btn-compact">Volver</a>
                        <a href="crear_reserva.php" class="btn btn-primary btn-compact">Nueva</a>
                    </div>
                </div>

                <div class="kpi-grid">
                    <article class="kpi-card neutral">
                        <span>Pendientes</span>
                        <strong>1</strong>
                    </article>
                    <article class="kpi-card success">
                        <span>Aprobadas</span>
                        <strong>1</strong>
                    </article>
                    <article class="kpi-card warning">
                        <span>Rechazadas</span>
                        <strong>1</strong>
                    </article>
                    <article class="kpi-card info">
                        <span>Hoy</span>
                        <strong>03</strong>
                    </article>
                </div>

                <div class="filter-bar" aria-label="Filtros de reservas">
                    <button type="button" class="filter-pill is-active" data-filter="all" aria-pressed="true">Todas</button>
                    <button type="button" class="filter-pill" data-filter="pendiente" aria-pressed="false">Pendientes</button>
                    <button type="button" class="filter-pill" data-filter="aprobada" aria-pressed="false">Aprobadas</button>
                    <button type="button" class="filter-pill" data-filter="rechazada" aria-pressed="false">Rechazadas</button>
                </div>

                <div class="data-block">
                    <div class="table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Docente</th>
                                    <th>Aula</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($solicitudes as $solicitud): ?>
                                    <tr
                                        data-detail-target
                                        data-title="<?= htmlspecialchars($solicitud['id']); ?>"
                                        data-code="<?= htmlspecialchars($solicitud['id']); ?>"
                                        data-capacity="<?= htmlspecialchars($solicitud['aula']); ?>"
                                        data-status="<?= htmlspecialchars($solicitud['estado']); ?>"
                                        data-equipment="<?= htmlspecialchars($solicitud['motivo']); ?>"
                                        data-horario="<?= htmlspecialchars($solicitud['horario']); ?>"
                                    >
                                        <td><?= htmlspecialchars($solicitud['id']); ?></td>
                                        <td><?= htmlspecialchars($solicitud['docente']); ?></td>
                                        <td><?= htmlspecialchars($solicitud['aula']); ?></td>
                                        <td><?= htmlspecialchars($solicitud['fecha']); ?></td>
                                        <td>
                                            <span class="status-badge status-<?= strtolower(str_replace(' ', '-', $solicitud['estado'])); ?>"><?= htmlspecialchars($solicitud['estado']); ?></span>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <aside class="detail-panel" aria-label="Detalle de la reserva">
                <div class="detail-panel-header">
                    <div>
                        <p>Detalle</p>
                        <h3 id="detailTitle">Reserva</h3>
                    </div>
                    <button type="button" class="panel-close" data-close-panel aria-label="Cerrar panel">×</button>
                </div>

                <dl class="detail-list">
                    <div>
                        <dt>ID</dt>
                        <dd id="detailCode">-</dd>
                    </div>
                    <div>
                        <dt>Aula</dt>
                        <dd id="detailCapacity">-</dd>
                    </div>
                    <div>
                        <dt>Estado</dt>
                        <dd id="detailStatus">-</dd>
                    </div>
                    <div>
                        <dt>Motivo</dt>
                        <dd id="detailEquipment">-</dd>
                    </div>
                </dl>

                <div class="detail-panel-actions">
                    <button type="button" class="btn btn-primary btn-block">Aprobar</button>
                    <button type="button" class="btn btn-secondary btn-block">Rechazar</button>
                </div>
            </aside>
        </main>
    </div>

    <?php require_once '../includes/footer.php'; ?>
</body>
</html>
