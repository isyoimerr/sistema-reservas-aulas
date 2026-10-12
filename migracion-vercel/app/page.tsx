import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-shell landing-page">
      <header className="app-header">
        <div className="container">
          <div className="topbar">
            <Link href="/" className="brand" aria-label="Inicio institucional">
              <div className="brand-mark">
                <span>IE</span>
                <strong>Reservas</strong>
              </div>
            </Link>

            <nav className="main-nav" aria-label="Menú principal">
              <div className="nav-dropdown">
                <button className="nav-dropdown-toggle" type="button" aria-expanded="false">
                  Industrias
                  <i className="bi bi-chevron-down" aria-hidden="true" />
                </button>
              </div>

              <div className="nav-dropdown">
                <button className="nav-dropdown-toggle" type="button" aria-expanded="false">
                  Funciones
                  <i className="bi bi-chevron-down" aria-hidden="true" />
                </button>
              </div>

              <div className="nav-dropdown">
                <button className="nav-dropdown-toggle" type="button" aria-expanded="false">
                  Recursos
                  <i className="bi bi-chevron-down" aria-hidden="true" />
                </button>
              </div>
            </nav>

            <div className="header-actions">
              <Link href="/login" className="btn btn-ghost btn-compact">
                Iniciar sesión
              </Link>
              <Link href="/registro" className="btn btn-primary btn-compact">
                Registro
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="landing-inner">
        <section className="hero-block">
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">Gestión institucional</p>
              <h1>Reserva de aulas</h1>
              <p className="hero-subtitle">Control operativo para horarios y campus.</p>

              <div className="hero-actions">
                <Link href="/login" className="btn btn-primary">
                  Iniciar sesión
                </Link>
                <Link href="/registro" className="btn btn-ghost">
                  Registrarse
                </Link>
              </div>
            </div>

            <div className="hero-visual" id="tecnologia">
              <div className="visual-panel">
                <div className="visual-surface" />
              </div>
            </div>
          </div>
        </section>

        <section className="metrics-section">
          <div className="metrics-grid">
            <article className="metric-card" id="aulas">
              <strong>18</strong>
              <span>Aulas</span>
            </article>
            <article className="metric-card" id="docentes">
              <strong>42</strong>
              <span>Docentes</span>
            </article>
            <article className="metric-card" id="campus">
              <strong>09</strong>
              <span>Reservas</span>
            </article>
          </div>
        </section>

        <section className="purpose-section">
          <div className="purpose-grid">
            <article className="purpose-card" id="educacion">
              <h3>Qué es</h3>
              <p>Plataforma institucional para la gestión y control de reservas de aulas en tiempo real.</p>
            </article>
            <article className="purpose-card" id="administracion">
              <h3>Para quién</h3>
              <p>Diseñado para la optimización operativa de docentes, coordinadores y personal administrativo del campus.</p>
            </article>
          </div>
        </section>

        <section className="value-section">
          <div className="feature-stack">
            <article className="value-card" id="reservas">
              <div className="icon-wrap"><i className="bi bi-calendar3" aria-hidden="true" /></div>
              <h2>Reservar</h2>
              <p>Ordena solicitudes y asigna espacios sin fricción.</p>
            </article>
            <article className="value-card" id="disponibilidad">
              <div className="icon-wrap"><i className="bi bi-search" aria-hidden="true" /></div>
              <h2>Consultar</h2>
              <p>Revisa disponibilidad y horario real del campus.</p>
            </article>
            <article className="value-card" id="control">
              <div className="icon-wrap"><i className="bi bi-clipboard-check" aria-hidden="true" /></div>
              <h2>Gestionar</h2>
              <p>Coordina aulas y turnos desde un único panel.</p>
            </article>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-panel">
            <p>Gestiona la operación académica con claridad.</p>
            <Link href="/registro" className="btn btn-primary">
              Registrarse
            </Link>
          </div>
        </section>
      </div>

      <footer className="app-footer" aria-label="Aviso institucional">
        <div className="container bottom-bar">
          <div className="bottom-bar-copy">
            <strong>Plataforma institucional</strong>
            <span>Gestión operativa de reservas, disponibilidad y coordinación de aulas del campus en tiempo real.</span>
          </div>
          <button className="bottom-bar-close" type="button" aria-label="Cerrar aviso">
            Entendido
          </button>
        </div>
      </footer>
    </main>
  );
}
