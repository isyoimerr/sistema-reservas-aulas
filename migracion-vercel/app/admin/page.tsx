"use client";

import RoleSidebar from "@/components/role-sidebar";
import { isAdminSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState({ totalUsuarios: 0, totalReservas: 0, pendientes: 0 });
  const hasDatabase = Boolean(supabase);

  useEffect(() => {
    const role = localStorage.getItem("session-role");
    const sessionEmail = localStorage.getItem("session-email") ?? "";

    if (!isAdminSession()) {
      if (role === "Profesor") {
        router.replace("/dashboard");
        return;
      }

      router.replace("/login");
      return;
    }

    setEmail(sessionEmail || "");

    const loadStats = async () => {
      if (!supabase) {
        setStats({ totalUsuarios: 0, totalReservas: 0, pendientes: 0 });
        return;
      }

      const [{ count: usuariosCount }, { count: reservasCount }, { count: pendientesCount }] = await Promise.all([
        supabase.from("usuarios").select("id_usuario", { count: "exact", head: true }),
        supabase.from("reservas").select("id_reserva", { count: "exact", head: true }),
        supabase.from("reservas").select("id_reserva", { count: "exact", head: true }).eq("estado", "Pendiente"),
      ]);

      setStats({
        totalUsuarios: usuariosCount ?? 0,
        totalReservas: reservasCount ?? 0,
        pendientes: pendientesCount ?? 0,
      });
    };

    loadStats();
  }, [router]);

  return (
    <main className="page-shell admin-shell">
      <RoleSidebar />

      <section className="content-panel admin-content">
        <header className="topbar admin-topbar">
          <div className="admin-header-copy">
            <p className="eyebrow">Administración</p>
            <h1>Panel general</h1>
          </div>

          <div className="user-pill admin-pill">
            <span>Superadministrador</span>
            <small>{email || "Sin sesión activa"}</small>
          </div>
        </header>

        <div className="stats-grid admin-stats-grid">
          <article className="stat-card accent">
            <p>Reservas pendientes</p>
            <strong>{stats.pendientes}</strong>
          </article>
          <article className="stat-card">
            <p>Usuarios activos</p>
            <strong>{stats.totalUsuarios}</strong>
          </article>
          <article className="stat-card">
            <p>Reservas totales</p>
            <strong>{stats.totalReservas}</strong>
          </article>
        </div>

        <div className="dashboard-layout">
          <article className="info-card admin-card dashboard-section">
            <div className="section-header">
              <h3>Control operativo</h3>
              <span>Resumen</span>
            </div>
            <ul className="list">
              <li>Validar solicitudes por aula.</li>
              <li>Revisar horarios docentes.</li>
              <li>Gestionar usuarios y permisos.</li>
              <li>Supervisar reportes y seguimiento.</li>
            </ul>
          </article>

          <article className="info-card admin-card dashboard-section activity-card">
            <div className="section-header">
              <h3>Registro de actividades</h3>
              <span>Actual</span>
            </div>
            {hasDatabase ? (
              <p className="empty-state">No hay actividad reciente en la base de datos.</p>
            ) : (
              <p className="empty-state">La base de datos no está configurada para registrar actividad real.</p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
