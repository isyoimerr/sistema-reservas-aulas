<?php
session_start();
require_once '../config/rbac.php';
require_once '../config/conexion.php';

requireAdmin('../login/index.php', 'No tienes permisos para gestionar usuarios.');

$rbacAlert = $_SESSION['rbac_error'] ?? null;
unset($_SESSION['rbac_error']);
$rbacSuccess = $_SESSION['rbac_success'] ?? null;
unset($_SESSION['rbac_success']);

$stmt = $pdo->query(
    'SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.estado, r.nombre_rol
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     ORDER BY u.estado DESC, u.apellido, u.nombre'
);
$usuarios = $stmt->fetchAll();
$usuarioSesion = $_SESSION['nombre'] ?? ($_SESSION['usuario_nombre'] ?? 'Usuario');
$rolSesion = normalizeRole((string) ($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? 'Superadministrador'));
$avatarSesion = '../img/default-avatar.svg';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Gestión de usuarios</title>
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
                <a href="gestionar_usuarios.php" class="nav-link is-active"><i class="bi bi-people"></i><span>Usuarios</span></a>
                <a href="../aulas/gestionar_aula.php" class="nav-link"><i class="bi bi-building"></i><span>Aulas</span></a>
                <a href="../reservas/consultar.php" class="nav-link"><i class="bi bi-calendar3"></i><span>Reservas</span></a>
                <a href="../horarios/cargar_horario.php" class="nav-link"><i class="bi bi-clock-history"></i><span>Horarios</span></a>
                <a href="../reportes/index.php" class="nav-link"><i class="bi bi-graph-up-arrow"></i><span>Reportes</span></a>
                <a href="perfil.php" class="nav-link"><i class="bi bi-person-circle"></i><span>Perfil</span></a>
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
                        <h1>Usuarios</h1>
                    </div>
                    <div class="header-actions compact-actions">
                        <a href="panel_admin.php" class="btn btn-secondary btn-compact">Volver</a>
                    </div>
                </div>

                <div class="card shadow mt-3">
                    <div class="card-body">
                        <h2 class="mb-3">Gestión de usuarios</h2>

                        <div class="card mb-3 border-0 bg-light">
                            <div class="card-body">
                                <h4 class="mb-3">Crear usuario</h4>
                                <form action="procesar_nuevo_usuario.php" method="POST" class="row g-3">
                                    <div class="col-md-3">
                                        <label class="form-label">Nombre</label>
                                        <input type="text" name="nombre" class="form-control" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Apellido</label>
                                        <input type="text" name="apellido" class="form-control" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Correo</label>
                                        <input type="email" name="email" class="form-control" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Contraseña</label>
                                        <input type="password" name="password" class="form-control" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Rol</label>
                                        <select name="rol" class="form-select">
                                            <option value="Profesor">Profesor</option>
                                            <option value="Superadministrador">Superadministrador</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Estado</label>
                                        <select name="estado" class="form-select">
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 d-flex align-items-end justify-content-end">
                                        <button type="submit" class="btn btn-primary">Registrar usuario</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-striped table-hover align-middle data-table">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Rol</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($usuarios as $usuario): ?>
                                        <tr>
                                            <td><?= htmlspecialchars($usuario['nombre'] . ' ' . $usuario['apellido']); ?></td>
                                            <td><?= htmlspecialchars($usuario['email']); ?></td>
                                            <td><?= htmlspecialchars($usuario['nombre_rol']); ?></td>
                                            <td>
                                                <span class="badge <?= $usuario['estado'] === 'Activo' ? 'bg-success' : 'bg-secondary'; ?>">
                                                    <?= htmlspecialchars($usuario['estado']); ?>
                                                </span>
                                            </td>
                                            <td>
                                                <form action="procesar_estado_usuario.php" method="POST" class="d-flex gap-2 align-items-center">
                                                    <input type="hidden" name="id_usuario" value="<?= (int) $usuario['id_usuario']; ?>">
                                                    <select name="estado" class="form-select form-select-sm">
                                                        <option value="Activo" <?= $usuario['estado'] === 'Activo' ? 'selected' : ''; ?>>Activo</option>
                                                        <option value="Inactivo" <?= $usuario['estado'] === 'Inactivo' ? 'selected' : ''; ?>>Inactivo</option>
                                                    </select>
                                                    <button type="submit" class="btn btn-primary btn-sm">Guardar</button>
                                                </form>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <?php require_once '../includes/footer.php'; ?>
</body>
</html>
