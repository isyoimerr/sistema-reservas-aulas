"use client";

import RoleSidebar from "@/components/role-sidebar";
import { isAdminSession, isProfessorSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ aulasActivas: 0, reservasEsteMes: 0, disponiblesHoy: 0 });
  const [recentActivities, setRecentActivities] = useState<Array<{ title: string; time: string }>>([]);

  const loadDashboardData = async () => {
    const client = supabase;

    if (!client) {
      setStats({ aulasActivas: 0, reservasEsteMes: 0, disponiblesHoy: 0 });
      setRecentActivities([]);
      setLoading(false);
      setError("La base de datos no está configurada para mostrar información del dashboard.");
      return;
    }

    try {
      setLoading(true);

      const [aulasResult, reservasResult] = await Promise.all([
        client.from("aulas").select("id_aula, estado").eq("estado", "Activo"),
        client.from("reservas").select("id_reserva, fecha_reserva, hora_inicio, hora_fin, estado").order("fecha_reserva", { ascending: false }),
      ]);

      if (aulasResult.error) {
        throw aulasResult.error;
      }

      if (reservasResult.error) {
        throw reservasResult.error;
      }

      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const reservas = reservasResult.data ?? [];
      const reservasEsteMes = reservas.filter((reserva) => {
        const fecha = new Date(reserva.fecha_reserva);
        return !Number.isNaN(fecha.getTime()) && fecha >= monthStart && fecha <= today;
      }).length;

      const disponiblesHoy = (aulasResult.data ?? []).filter((aula) => aula.estado === "Activo").length;

      const latestActivities = (reservas.slice(0, 4) ?? []).map((reserva) => ({
        title: `Reserva ${reserva.estado ?? "Pendiente"}`,
        time: reserva.fecha_reserva ?? "Sin fecha",
      }));

      setStats({
        aulasActivas: (aulasResult.data ?? []).length,
        reservasEsteMes,
        disponiblesHoy,
      });
      setRecentActivities(latestActivities.length ? latestActivities : [{ title: "Sin actividades recientes", time: "Pendiente" }]);
      setError(null);
    } catch (loadError) {
      console.error("Error cargando dashboard:", loadError);
      setError("No se pudo actualizar la información del dashboard en este momento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("session-role") ?? "";
    const storedEmail = localStorage.getItem("session-email") ?? "";

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

    void loadDashboardData();

    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("dashboard-panel-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "aulas" }, () => {
        void loadDashboardData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reservas" }, () => {
        void loadDashboardData();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [router]);

  const activityList = useMemo(() => recentActivities, [recentActivities]);

  return (
    <main className="page-shell compact-shell">
      <RoleSidebar />

      <section className="content-panel compact-panel">
        <header className="topbar compact-topbar">
          <div>
            <p className="eyebrow">Panel</p>
            <h1>Dashboard</h1>
          </div>
          <div className="user-pill compact-user-pill">
            <span>{role}</span>
            <small>{email}</small>
          </div>
        </header>

        {error ? <div className="info-banner" role="status">{error}</div> : null}

        {loading ? (
          <PanelSkeleton />
        ) : (
          <>
            <div className="stats-grid compact-stats-grid">
              <article className="stat-card accent compact-stat-card">
                <p>Aulas activas</p>
                <strong>{stats.aulasActivas}</strong>
              </article>
              <article className="stat-card compact-stat-card">
                <p>Reservas este mes</p>
                <strong>{String(stats.reservasEsteMes).padStart(2, "0")}</strong>
              </article>
              <article className="stat-card compact-stat-card">
                <p>Disponibles hoy</p>
                <strong>{String(stats.disponiblesHoy).padStart(2, "0")}</strong>
              </article>
            </div>

            <div className="dashboard-layout compact-dashboard-layout">
              <article className="info-card dashboard-section compact-info-card">
                <div className="section-header">
                  <h3>Próximas reservas</h3>
                  <span>Agenda</span>
                </div>
                <ul className="list">
                  {activityList.length ? activityList.map((activity) => (
                    <li key={`${activity.title}-${activity.time}`}>{activity.title} — {activity.time}</li>
                  )) : <li>Sin reservas registradas.</li>}
                </ul>
              </article>

              <article className="info-card dashboard-section activity-card compact-info-card">
                <div className="section-header">
                  <h3>Registro de actividades</h3>
                  <span>Reciente</span>
                </div>
                <ul className="activity-list">
                  {activityList.map((activity) => (
                    <li key={`${activity.title}-${activity.time}`}>
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
          </>
        )}
      </section>
    </main>
  );
}
