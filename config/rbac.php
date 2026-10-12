<?php
function normalizeRole(?string $role): string
{
    $raw = trim((string) ($role ?? ''));
    if ($raw === '') {
        return '';
    }

    $normalized = strtolower(str_replace([' ', '-', '_'], '', $raw));

    if (in_array($normalized, ['superadministrador', 'administrador', 'admin'], true)) {
        return 'Superadministrador';
    }

    if (in_array($normalized, ['profesor', 'docente', 'teacher'], true)) {
        return 'Profesor';
    }

    return $raw;
}

function currentUserRole(): string
{
    $role = $_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? '';
    return normalizeRole((string) $role);
}

function redirectAuthenticatedUser(string $basePath = ''): void
{
    $base = trim((string) $basePath);
    $prefix = $base !== '' ? rtrim($base, '/') : '';
    $target = currentUserRole() === 'Superadministrador'
        ? $prefix . '/admin/panel_admin.php'
        : $prefix . '/dashboard.php';

    header('Location: ' . $target);
    exit;
}

function hasRole(array $allowedRoles): bool
{
    $role = currentUserRole();
    foreach ($allowedRoles as $allowedRole) {
        if (normalizeRole((string) $allowedRole) === $role) {
            return true;
        }
    }
    return false;
}

function requireAuth(string $redirect = '../login/index.php'): void
{
    $hasSession = isset($_SESSION['id_usuario']) || isset($_SESSION['usuario_id']);

    if (!$hasSession) {
        session_unset();
        session_destroy();
        header('Location: ' . $redirect);
        exit;
    }
}

function requireRole(array $allowedRoles, string $redirect = '../login/index.php', string $message = 'No tienes permisos para esta acción.'): void
{
    requireAuth($redirect);

    if (!hasRole($allowedRoles)) {
        http_response_code(403);
        $_SESSION['rbac_error'] = $message;
        $target = $redirect;
        if (strpos($target, '?') === false) {
            $target .= '?error=403';
        } else {
            $target .= '&error=403';
        }
        $target .= '&message=' . rawurlencode($message);
        header('Location: ' . $target);
        exit;
    }
}

function requireAdmin(string $redirect = '../login/index.php', string $message = 'Esta acción requiere permisos de administrador.'): void
{
    requireRole(['Superadministrador'], $redirect, $message);
}

function requireTeacherOrAdmin(string $redirect = '../login/index.php', string $message = 'Esta acción requiere permisos del docente o administrador.'): void
{
    requireRole(['Profesor', 'Superadministrador'], $redirect, $message);
}
