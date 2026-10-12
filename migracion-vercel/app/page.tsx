import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <section className="hero-card">
        <nav className="top-nav">
          <div className="brand-mark">
            <span>IE</span>
            <strong>Reservas</strong>
          </div>

          <div className="nav-links">
            <Link href="/login">Acceder</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Migración a Vercel + Supabase</p>
            <h1>Gestiona aulas, horarios y reservas sin fricción.</h1>
            <p className="lead">
              Este proyecto conserva la lógica original del sistema y se prepara para
              desplegarse en un entorno moderno, seguro y escalable.
            </p>

            <div className="cta-row">
              <Link href="/login" className="primary-button">
                Iniciar sesión
              </Link>
              <Link href="/reservas" className="secondary-button">
                Ver reservas
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="mini-card">
              <span>Disponibilidad</span>
              <strong>06 aulas libres</strong>
            </div>
            <div className="mini-card alt">
              <span>Reservas pendientes</span>
              <strong>14 solicitudes</strong>
            </div>
            <div className="mini-card">
              <span>Usuarios</span>
              <strong>74 activos</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
