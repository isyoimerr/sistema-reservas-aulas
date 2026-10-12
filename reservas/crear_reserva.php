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

if (!in_array(normalizeRole($rolActual), ['Profesor', 'Superadministrador'], true)) {
    session_unset();
    session_destroy();
    header('Location: ../login/index.php?error=acceso_denegado');
    exit;
}

$aulasStmt = $pdo->query(
    'SELECT id_aula, codigo_aula, nombre_aula, capacidad, estado
     FROM aulas
     WHERE estado = "Activo"
     ORDER BY nombre_aula ASC'
);
$aulas = $aulasStmt->fetchAll();

$usuarioSesion = $_SESSION['nombre'] ?? ($_SESSION['usuario_nombre'] ?? 'Usuario');
$rolSesion = normalizeRole((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? 'Profesor'));
$avatarSesion = '../img/default-avatar.svg';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Nueva reserva</title>
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
                <a href="mis_reservas.php" class="nav-link"><i class="bi bi-calendar3"></i><span>Mis reservas</span></a>
                <a href="crear_reserva.php" class="nav-link is-active"><i class="bi bi-plus-square"></i><span>Nueva reserva</span></a>
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
                        <h1>Nueva reserva</h1>
                    </div>
                    <div class="header-actions compact-actions">
                        <a href="mis_reservas.php" class="btn btn-secondary btn-compact">Ver mis reservas</a>
                    </div>
                </div>

                <div class="card shadow-sm mt-3">
                    <div class="card-body p-4">
                        <?php if (isset($_SESSION['reserva_error'])): ?>
                            <div class="alert alert-danger">
                                <?= htmlspecialchars($_SESSION['reserva_error']); ?>
                            </div>
                            <?php unset($_SESSION['reserva_error']); ?>
                        <?php endif; ?>

                        <?php if (isset($_SESSION['reserva_exito'])): ?>
                            <div class="alert alert-success">
                                <?= htmlspecialchars($_SESSION['reserva_exito']); ?>
                            </div>
                            <?php unset($_SESSION['reserva_exito']); ?>
                        <?php endif; ?>

                        <form action="procesar_reserva.php" method="POST" class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Aula</label>
                                <select name="id_aula" class="form-select" required>
                                    <option value="">Seleccione un aula</option>
                                    <?php foreach ($aulas as $aula): ?>
                                        <option value="<?= (int) $aula['id_aula']; ?>">
                                            <?= htmlspecialchars($aula['codigo_aula'] . ' - ' . $aula['nombre_aula'] . ' (' . $aula['capacidad'] . ' personas)'); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Fecha de uso</label>
                                <input type="date" class="form-control" name="fecha_reserva" min="<?= date('Y-m-d'); ?>" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Hora inicio</label>
                                <input type="time" class="form-control" name="hora_inicio" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Hora fin</label>
                                <input type="time" class="form-control" name="hora_fin" required>
                            </div>

                            <div class="col-12">
                                <label class="form-label">Motivo de la reserva</label>
                                <textarea class="form-control" name="motivo" rows="4" placeholder="Ejemplo: sesión de clase, reunión de coordinación, examen, taller..."></textarea>
                            </div>

                            <div class="col-12 d-flex flex-wrap gap-2 mt-3">
                                <button type="submit" class="btn btn-primary">Enviar solicitud</button>
                                <a href="mis_reservas.php" class="btn btn-outline-secondary">Ver mis reservas</a>
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
