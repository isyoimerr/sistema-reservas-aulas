"use client";

import RoleSidebar from "@/components/role-sidebar";
import { useState } from "react";

export default function DashboardPage() {
  const recentActivities = [
    { title: "Reserva creada para Aula 104", time: "Hace 15 min" },
    { title: "Horario actualizado", time: "Hace 45 min" },
    { title: "Solicitud confirmada", time: "Hace 2 horas" },
    { title: "Cuenta revisada por administración", time: "Hace 1 día" },
  ];

  const [role] = useState(() => {
    if (typeof window === "undefined") {
      return "Profesor";
    }

    return localStorage.getItem("session-role") ?? "Profesor";
  });

  const [email] = useState(() => {
    if (typeof window === "undefined") {
      return "profesor@sistema.com";
    }

    return localStorage.getItem("session-email") ?? "profesor@sistema.com";
  });

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
            <strong>12</strong>
          </article>
          <article className="stat-card">
            <p>Reservas este mes</p>
            <strong>38</strong>
          </article>
          <article className="stat-card">
            <p>Disponibles hoy</p>
            <strong>06</strong>
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
