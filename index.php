<?php
session_start();
$usuarioLogueado = isset($_SESSION['id_usuario']) || isset($_SESSION['usuario_id']);
$nombreUsuario = $_SESSION['nombre'] ?? $_SESSION['usuario_nombre'] ?? 'Usuario';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Institución Educativa Técnica José Agustín Blanco Barros | Reservas de Aulas</title>
    <meta name="description" content="Gestión de reservas institucionales para un campus organizado.">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/estilos.css">
</head>
<body class="landing-page">
    <div class="system-banner" aria-live="polite" role="status">Sin conexión. Reintentando…</div>

    <header class="app-header">
        <div class="container">
            <div class="topbar">
                <a class="brand" href="index.php" aria-label="Inicio institucional">
                    <img src="img/logo-institucion.png" alt="Logo de la institución" class="brand-logo">
                    <span class="brand-text">ITEJABB</span>
                </a>

                <nav class="main-nav" aria-label="Menú principal">
                    <div class="nav-dropdown">
                        <button class="nav-dropdown-toggle" type="button" aria-expanded="false">
                            Industrias
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="#educacion">Educación</a>
                            <a href="#tecnologia">Tecnología</a>
                            <a href="#administracion">Administración</a>
                        </div>
                    </div>

                    <div class="nav-dropdown">
                        <button class="nav-dropdown-toggle" type="button" aria-expanded="false">
                            Funciones
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="#reservas">Reservas</a>
                            <a href="#disponibilidad">Disponibilidad</a>
                            <a href="#control">Control</a>
                        </div>
                    </div>

                    <div class="nav-dropdown">
                        <button class="nav-dropdown-toggle" type="button" aria-expanded="false">
                            Recursos
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="#aulas">Aulas</a>
                            <a href="#docentes">Docentes</a>
                            <a href="#campus">Campus</a>
                        </div>
                    </div>
                </nav>

                <div class="header-actions">
                    <a href="login/index.php" class="btn btn-ghost btn-compact">Iniciar sesión</a>
                    <a href="usuarios/registro_profesor.php" class="btn btn-primary btn-compact">Registro</a>
                </div>

                <button class="mobile-menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </header>

    <aside class="mobile-drawer" aria-label="Menú lateral">
        <div class="drawer-backdrop"></div>
        <div class="drawer-panel">
            <div class="drawer-header">
                <a class="brand" href="index.php" aria-label="Inicio institucional">
                    <img src="img/logo-institucion.png" alt="Logo de la institución" class="brand-logo">
                    <span class="brand-text">ITEJABB</span>
                </a>
                <button class="drawer-close" type="button" aria-label="Cerrar menú">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <nav class="drawer-nav" aria-label="Menú móvil">
                <a href="#educacion">Industrias</a>
                <a href="#reservas">Funciones</a>
                <a href="#aulas">Recursos</a>
            </nav>

            <div class="drawer-actions">
                <a href="login/index.php" class="btn btn-ghost">Iniciar sesión</a>
                <a href="usuarios/registro_profesor.php" class="btn btn-primary">Registro</a>
            </div>
        </div>
    </aside>

    <main class="landing-shell">
        <div class="landing-inner">
            <section class="hero-block">
                <div class="hero-layout">
                    <div class="hero-copy">
                        <p class="eyebrow">Gestión institucional</p>
                        <h1>Reserva de aulas</h1>
                        <p class="hero-subtitle">Control operativo para horarios y campus.</p>
                        <div class="hero-actions">
                            <a href="login/index.php" class="btn btn-primary">Iniciar sesión</a>
                        </div>
                    </div>

                    <div class="hero-visual" id="tecnologia">
                        <div class="visual-panel">
                            <div class="visual-surface"></div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="metrics-section">
                <div class="metrics-grid">
                    <article class="metric-card" id="aulas">
                        <strong>18</strong>
                        <span>Aulas</span>
                    </article>
                    <article class="metric-card" id="docentes">
                        <strong>42</strong>
                        <span>Docentes</span>
                    </article>
                    <article class="metric-card" id="campus">
                        <strong>09</strong>
                        <span>Reservas</span>
                    </article>
                </div>
            </section>

            <section class="purpose-section">
                <div class="purpose-grid">
                    <article class="purpose-card" id="educacion">
                        <h3>Qué es</h3>
                        <p>Plataforma institucional para la gestión y control de reservas de aulas en tiempo real.</p>
                    </article>
                    <article class="purpose-card" id="administracion">
                        <h3>Para quién</h3>
                        <p>Diseñado para la optimización operativa de docentes, coordinadores y personal administrativo del campus.</p>
                    </article>
                </div>
            </section>

            <section class="value-section">
                <div class="feature-stack">
                    <article class="value-card" id="reservas">
                        <div class="icon-wrap"><i class="bi bi-calendar3"></i></div>
                        <h2>Reservar</h2>
                        <p>Ordena solicitudes y asigna espacios sin fricción.</p>
                    </article>
                    <article class="value-card" id="disponibilidad">
                        <div class="icon-wrap"><i class="bi bi-search"></i></div>
                        <h2>Consultar</h2>
                        <p>Revisa disponibilidad y horario real del campus.</p>
                    </article>
                    <article class="value-card" id="control">
                        <div class="icon-wrap"><i class="bi bi-clipboard-check"></i></div>
                        <h2>Gestionar</h2>
                        <p>Coordina aulas y turnos desde un único panel.</p>
                    </article>
                </div>
            </section>

            <section class="cta-section">
                <div class="cta-panel">
                    <p>Gestiona la operación académica con claridad.</p>
                    <a href="usuarios/registro_profesor.php" class="btn btn-primary">Registrarse</a>
                </div>
            </section>
        </div>
    </main>

    <footer class="app-footer" aria-label="Aviso institucional">
        <div class="container bottom-bar">
            <div class="bottom-bar-copy">
                <strong>Plataforma institucional</strong>
                <span>Gestión operativa de reservas, disponibilidad y coordinación de aulas del campus en tiempo real.</span>
            </div>
            <button class="bottom-bar-close" type="button" aria-label="Cerrar aviso">
                Entendido
            </button>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
