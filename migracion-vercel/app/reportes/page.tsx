"use client";

import RoleSidebar from "@/components/role-sidebar";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ReservaRecord = {
  id_reserva: number;
  estado: string;
  motivo: string | null;
  fecha_reserva: string;
  usuarios?: { nombre?: string; apellido?: string } | null;
  aulas?: { nombre_aula?: string } | null;
};

const fallbackReservas: ReservaRecord[] = [
  { id_reserva: 1, estado: "Aprobada", motivo: "Clase de programación", fecha_reserva: "2026-10-15", usuarios: { nombre: "Admin", apellido: "Sistema" }, aulas: { nombre_aula: "Aula 101" } },
  { id_reserva: 2, estado: "Pendiente", motivo: "Reunión de coordinación", fecha_reserva: "2026-10-16", usuarios: { nombre: "Ana", apellido: "Gómez" }, aulas: { nombre_aula: "Laboratorio 2" } },
  { id_reserva: 3, estado: "Rechazada", motivo: "Conferencia", fecha_reserva: "2026-10-18", usuarios: { nombre: "Luis", apellido: "Pérez" }, aulas: { nombre_aula: "Salón de grados" } },
];

export default function ReportesPage() {
  const [reservas, setReservas] = useState<ReservaRecord[]>([]);

  const loadData = async () => {
    if (!supabase) {
      setReservas(fallbackReservas);
      return;
    }

    const { data, error } = await supabase
      .from("reservas")
      .select("*, usuarios(nombre, apellido), aulas(nombre_aula)")
      .order("fecha_reserva", { ascending: false });

    if (error) return;
    setReservas((data as ReservaRecord[]) ?? []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    const counts = { Pendiente: 0, Aprobada: 0, Rechazada: 0, Cancelada: 0 };
    reservas.forEach((reserva) => {
      counts[reserva.estado as keyof typeof counts] = (counts[reserva.estado as keyof typeof counts] ?? 0) + 1;
    });
    return counts;
  }, [reservas]);

  const recent = [...reservas].slice(0, 6);

  return (
    <main className="page-shell">
      <RoleSidebar />

      <section className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Seguimiento</p>
            <h1>Reportes</h1>
          </div>
        </header>

        <div className="stats-grid">
          <article className="stat-card accent">
            <p>Pendientes</p>
            <strong>{summary.Pendiente}</strong>
          </article>
          <article className="stat-card">
            <p>Aprobadas</p>
            <strong>{summary.Aprobada}</strong>
          </article>
          <article className="stat-card">
            <p>Rechazadas</p>
            <strong>{summary.Rechazada}</strong>
          </article>
        </div>

        <div className="card-grid">
          <article className="info-card">
            <h3>Estado de reservas</h3>
            <ul className="list">
              <li>Pendientes: {summary.Pendiente}</li>
              <li>Aprobadas: {summary.Aprobada}</li>
              <li>Rechazadas: {summary.Rechazada}</li>
              <li>Canceladas: {summary.Cancelada}</li>
            </ul>
          </article>

          <article className="info-card">
            <h3>Últimas reservas</h3>
            <ul className="list">
              {recent.map((item) => (
                <li key={item.id_reserva}>
                  {item.usuarios?.nombre ?? "Docente"} {item.usuarios?.apellido ?? ""} · {item.aulas?.nombre_aula ?? "Aula"} · {item.estado}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
