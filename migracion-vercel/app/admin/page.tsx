"use client";

import RoleSidebar from "@/components/role-sidebar";
import { isAdminSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@sistema.com");
  const [stats, setStats] = useState({ totalUsuarios: 0, totalReservas: 0, pendientes: 0 });

  const recentActivities = [
    { title: "Reservas pendientes revisadas", time: "Hace 10 min" },
    { title: "Usuario actualizado", time: "Hace 28 min" },
    { title: "Horario académico modificado", time: "Hace 1 hora" },
    { title: "Aula LAB-02 activada", time: "Hace 2 horas" },
  ];

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

    setEmail(sessionEmail || "admin@sistema.com");

    const loadStats = async () => {
      if (!supabase) {
        setStats({ totalUsuarios: 6, totalReservas: 5, pendientes: 2 });
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
            <small>{email}</small>
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
              <span>Hoy</span>
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
