"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminPage() {
  const [email] = useState(() => {
    if (typeof window === "undefined") {
      return "admin@sistema.com";
    }

    return localStorage.getItem("session-email") ?? "admin@sistema.com";
  });

  return (
    <main className="page-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <span>AD</span>
          <strong>Admin</strong>
        </div>

        <nav>
          <Link href="/admin">Resumen</Link>
          <Link href="/reservas">Reservas</Link>
          <Link href="/login">Salir</Link>
        </nav>
      </aside>

      <section className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Administración</p>
            <h1>Panel general</h1>
          </div>
          <div className="user-pill admin-pill">
            <span>Superadministrador</span>
            <small>{email}</small>
          </div>
        </header>

        <div className="stats-grid">
          <article className="stat-card accent">
            <p>Reservas pendientes</p>
            <strong>14</strong>
          </article>
          <article className="stat-card">
            <p>Usuarios activos</p>
            <strong>74</strong>
          </article>
          <article className="stat-card">
            <p>Incidencias</p>
            <strong>02</strong>
          </article>
        </div>

        <div className="card-grid">
          <article className="info-card">
            <h3>Control operativo</h3>
            <ul className="list">
              <li>Validar solicitudes por aula.</li>
              <li>Revisar horarios docentes.</li>
              <li>Gestionar usuarios y permisos.</li>
            </ul>
          </article>

          <article className="info-card">
            <h3>Revisión rápida</h3>
            <ul className="list">
              <li>Laboratorio 2 - pendiente</li>
              <li>Aula 201 - aprobada</li>
              <li>Salón de grados - requiere revisión</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
