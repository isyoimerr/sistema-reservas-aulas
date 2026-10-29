"use client";

import RoleSidebar from "@/components/role-sidebar";
import { isAdminSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function PanelSkeleton() {
  return (
    <div className="panel-skeleton" aria-hidden="true">
      <div className="panel-skeleton-card panel-skeleton-line skeleton-banner" />
      <div className="panel-skeleton-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="panel-skeleton-card panel-skeleton-line skeleton-metric" />
        ))}
      </div>
      <div className="panel-skeleton-card panel-skeleton-line skeleton-panel" />
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState({ totalUsuarios: 0, totalReservas: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasDatabase = Boolean(supabase);

  const loadStats = async () => {
    const client = supabase;

    if (!client) {
      setStats({ totalUsuarios: 0, totalReservas: 0, pendientes: 0 });
      setLoading(false);
      setError("La base de datos no está configurada para cargar métricas reales.");
      return;
    }

    try {
      setLoading(true);
      const [{ count: usuariosCount }, { count: reservasCount }, { count: pendientesCount }] = await Promise.all([
        client.from("usuarios").select("id_usuario", { count: "exact", head: true }),
        client.from("reservas").select("id_reserva", { count: "exact", head: true }),
        client.from("reservas").select("id_reserva", { count: "exact", head: true }).eq("estado", "Pendiente"),
      ]);

      setStats({
        totalUsuarios: usuariosCount ?? 0,
        totalReservas: reservasCount ?? 0,
        pendientes: pendientesCount ?? 0,
      });
      setError(null);
    } catch (loadError) {
      console.error("Error cargando métricas del panel admin:", loadError);
      setError("No se pudieron actualizar las métricas del panel en este momento.");
    } finally {
      setLoading(false);
    }
  };

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
    void loadStats();

    const client = supabase;
    if (!client) {
      return;
    }

    const channel = client
      .channel("admin-panel-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "usuarios" }, () => {
        void loadStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reservas" }, () => {
        void loadStats();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [router]);

  return (
    <main className="page-shell admin-shell compact-shell">
      <RoleSidebar />

      <section className="content-panel admin-content compact-panel">
        <header className="topbar admin-topbar compact-topbar">
          <div className="admin-header-copy">
            <p className="eyebrow">Administración</p>
            <h1>Panel general</h1>
          </div>

          <div className="user-pill admin-pill compact-user-pill">
            <span>Superadministrador</span>
            <small>{email || "Sin sesión activa"}</small>
          </div>
        </header>

        {error ? <div className="info-banner" role="status">{error}</div> : null}

        {loading ? (
          <PanelSkeleton />
        ) : (
          <>
            <div className="stats-grid admin-stats-grid compact-stats-grid">
              <article className="stat-card accent compact-stat-card">
                <p>Reservas pendientes</p>
                <strong>{stats.pendientes}</strong>
              </article>
              <article className="stat-card compact-stat-card">
                <p>Usuarios activos</p>
                <strong>{stats.totalUsuarios}</strong>
              </article>
              <article className="stat-card compact-stat-card">
                <p>Reservas totales</p>
                <strong>{stats.totalReservas}</strong>
              </article>
            </div>

            <div className="dashboard-layout compact-dashboard-layout">
              <article className="info-card admin-card dashboard-section compact-info-card">
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

              <article className="info-card admin-card dashboard-section activity-card compact-info-card">
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
          </>
        )}
      </section>
    </main>
  );
}
