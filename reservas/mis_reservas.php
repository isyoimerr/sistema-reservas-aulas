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

if ($rolActual === 'Superadministrador') {
    header('Location: ../admin/panel_admin.php');
    exit;
}

$stmt = $pdo->prepare(
    'SELECT r.id_reserva, a.codigo_aula, a.nombre_aula, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.motivo, r.estado, r.fecha_solicitud
     FROM reservas r
     INNER JOIN aulas a ON a.id_aula = r.id_aula
     WHERE r.id_usuario = :id_usuario
     ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC'
);
$stmt->execute([':id_usuario' => (int) $idUsuario]);
$reservas = $stmt->fetchAll();

$usuarioSesion = $_SESSION['nombre'] ?? ($_SESSION['usuario_nombre'] ?? 'Usuario');
$rolSesion = normalizeRole((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? 'Profesor'));
$avatarSesion = '../img/default-avatar.svg';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Mis reservas</title>
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
                <a href="mis_reservas.php" class="nav-link is-active"><i class="bi bi-calendar3"></i><span>Mis reservas</span></a>
                <a href="crear_reserva.php" class="nav-link"><i class="bi bi-plus-square"></i><span>Nueva reserva</span></a>
                <a href="../aulas/gestionar_aula.php" class="nav-link"><i class="bi bi-building"></i><span>Aulas</span></a>
                <a href="../horarios/cargar_horario.php" class="nav-link"><i class="bi bi-clock-history"></i><span>Horarios</span></a>
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
                        <h1>Mis reservas</h1>
                    </div>
                    <div class="header-actions compact-actions">
                        <a href="crear_reserva.php" class="btn btn-primary btn-compact">Nueva reserva</a>
                    </div>
                </div>

                <div class="kpi-grid">
                    <article class="kpi-card neutral">
                        <span>Solicitudes</span>
                        <strong><?= count($reservas); ?></strong>
                    </article>
                    <article class="kpi-card success">
                        <span>Aprobadas</span>
                        <strong><?= count(array_filter($reservas, fn($r) => $r['estado'] === 'Aprobada')); ?></strong>
                    </article>
                    <article class="kpi-card warning">
                        <span>Pendientes</span>
                        <strong><?= count(array_filter($reservas, fn($r) => $r['estado'] === 'Pendiente')); ?></strong>
                    </article>
                    <article class="kpi-card info">
                        <span>Estado</span>
                        <strong>Activo</strong>
                    </article>
                </div>

                <div class="data-block">
                    <div class="table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Aula</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Motivo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($reservas)): ?>
                                    <tr>
                                        <td colspan="5" class="text-center py-4">
                                            <div class="empty-state mb-0">
                                                <i class="bi bi-calendar-x fs-3 d-block mb-2"></i>
                                                Aún no tienes reservas registradas.
                                            </div>
                                        </td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($reservas as $reserva): ?>
                                        <tr>
                                            <td><?= htmlspecialchars($reserva['codigo_aula'] . ' - ' . $reserva['nombre_aula']); ?></td>
                                            <td><?= htmlspecialchars($reserva['fecha_reserva']); ?></td>
                                            <td><?= htmlspecialchars($reserva['hora_inicio'] . ' - ' . $reserva['hora_fin']); ?></td>
                                            <td><?= htmlspecialchars($reserva['motivo'] ?? 'Sin motivo indicado'); ?></td>
                                            <td>
                                                <span class="status-badge <?=
                                                    $reserva['estado'] === 'Aprobada' ? 'status-aprobada' :
                                                    ($reserva['estado'] === 'Rechazada' ? 'status-rechazada' :
                                                    ($reserva['estado'] === 'Cancelada' ? 'status-cancelada' : 'status-pendiente'));
                                                ?>">
                                                    <?= htmlspecialchars($reserva['estado']); ?>
                                                </span>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <?php require_once '../includes/footer.php'; ?>
</body>
</html>
