"use client";

import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
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
      <aside className="sidebar">
        <div className="brand-box">
          <span>IE</span>
          <strong>Reservas</strong>
        </div>

        <nav>
          <Link href="/dashboard">Inicio</Link>
          <Link href="/reservas">Reservas</Link>
          <Link href="/login">Cerrar sesión</Link>
        </nav>
      </aside>

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

        <div className="card-grid two-columns">
          <article className="info-card">
            <h3>Próximas reservas</h3>
            <ul className="list">
              <li>Laboratorio 2 — 9:00 a 11:00</li>
              <li>Aula 104 — 12:30 a 14:00</li>
              <li>Salón de grados — 15:00 a 17:00</li>
            </ul>
          </article>

          <article className="info-card">
            <h3>Recomendaciones</h3>
            <ul className="list">
              <li>Revisa la disponibilidad antes de crear una solicitud.</li>
              <li>Usa la vista de horarios para evitar conflictos.</li>
              <li>Los administradores revisan las reservas pendientes.</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
