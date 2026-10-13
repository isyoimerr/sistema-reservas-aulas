"use client";

import RoleSidebar from "@/components/role-sidebar";
import { isAdminSession, isProfessorSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("Profesor");
  const [email, setEmail] = useState("profesor@sistema.com");
  const [stats, setStats] = useState({ aulasActivas: 0, reservasEsteMes: 0, disponiblesHoy: 0 });
  const [recentActivities, setRecentActivities] = useState<Array<{ title: string; time: string }>>([]);

  useEffect(() => {
    const storedRole = localStorage.getItem("session-role") ?? "Profesor";
    const storedEmail = localStorage.getItem("session-email") ?? "profesor@sistema.com";

    setRole(storedRole);
    setEmail(storedEmail);

    if (!isProfessorSession()) {
      if (isAdminSession()) {
        router.replace("/admin");
        return;
      }

      router.replace("/login");
      return;
    }

    if (storedRole !== "Profesor") {
      router.replace("/login");
      return;
    }

    const reservas = JSON.parse(localStorage.getItem("demo-reservas") ?? "[]") as Array<Record<string, any>>;
    const aulas = JSON.parse(localStorage.getItem("demo-aulas") ?? "[]") as Array<Record<string, any>>;
    const auditoria = JSON.parse(localStorage.getItem("demo-auditoria") ?? "[]") as Array<Record<string, any>>;

    const fechaActual = new Date();
    const reservasEsteMes = reservas.filter((reserva) => {
      const fecha = new Date(reserva.fecha_reserva ?? fechaActual.toISOString());
      return fecha.getMonth() === fechaActual.getMonth() && fecha.getFullYear() === fechaActual.getFullYear();
    }).length;

    const reservasHoy = reservas.filter((reserva) => reserva.fecha_reserva === fechaActual.toISOString().split("T")[0]).length;
    const disponiblesHoy = Math.max(0, (aulas.length || 6) - reservasHoy);

    setStats({
      aulasActivas: aulas.length || 12,
      reservasEsteMes: reservasEsteMes || reservas.length || 0,
      disponiblesHoy,
    });

    const activities = (auditoria.length ? auditoria : [
      { action: "Reserva creada para Aula 104", timestamp: new Date().toISOString() },
      { action: "Horario actualizado", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { action: "Solicitud confirmada", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ]).slice(0, 4).map((entry) => ({
      title: entry.summary || entry.action || "Actividad de sistema",
      time: new Date(entry.timestamp).toLocaleDateString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    }));

    setRecentActivities(activities);
  }, [router]);

  return (
    <main className="page-shell">
      <RoleSidebar />

      <section className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Panel</p>
            <h1>Dashboard</h1>
          </div>
          <div className="user-pill">
            <span>{role}</span>
            <small>{email}</small>
          </div>
        </header>

        <div className="stats-grid">
          <article className="stat-card accent">
            <p>Aulas activas</p>
            <strong>{stats.aulasActivas}</strong>
          </article>
          <article className="stat-card">
            <p>Reservas este mes</p>
            <strong>{String(stats.reservasEsteMes).padStart(2, "0")}</strong>
          </article>
          <article className="stat-card">
            <p>Disponibles hoy</p>
            <strong>{String(stats.disponiblesHoy).padStart(2, "0")}</strong>
          </article>
        </div>

        <div className="dashboard-layout">
          <article className="info-card dashboard-section">
            <div className="section-header">
              <h3>Próximas reservas</h3>
              <span>Agenda</span>
            </div>
            <ul className="list">
              <li>Laboratorio 2 — 9:00 a 11:00</li>
              <li>Aula 104 — 12:30 a 14:00</li>
              <li>Salón de grados — 15:00 a 17:00</li>
            </ul>
          </article>

          <article className="info-card dashboard-section activity-card">
            <div className="section-header">
              <h3>Registro de actividades</h3>
              <span>Reciente</span>
            </div>
            <ul className="activity-list">
              {recentActivities.map((activity) => (
                <li key={activity.title}>
                  <span className="activity-dot" />
                  <div>
                    <strong>{activity.title}</strong>
                    <small>{activity.time}</small>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
