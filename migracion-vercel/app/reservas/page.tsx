import Link from "next/link";

const reservas = [
  { aula: "Aula 104", horario: "Lunes · 9:00 - 11:00", estado: "Aprobada" },
  { aula: "Laboratorio 2", horario: "Martes · 12:00 - 14:30", estado: "Pendiente" },
  { aula: "Salón de grados", horario: "Miércoles · 15:00 - 17:00", estado: "Aprobada" },
];

export default function ReservasPage() {
  return (
    <main className="page-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <span>R</span>
          <strong>Reservas</strong>
        </div>

        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/reservas">Reservas</Link>
          <Link href="/login">Salir</Link>
        </nav>
      </aside>

      <section className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Gestión</p>
            <h1>Reservas</h1>
          </div>
          <button className="primary-button" type="button">
            Nueva solicitud
          </button>
        </header>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Aula</th>
                <th>Horario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.aula}>
                  <td>{reserva.aula}</td>
                  <td>{reserva.horario}</td>
                  <td>
                    <span className={`status ${reserva.estado.toLowerCase()}`}>
                      {reserva.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
