"use client";

import RoleSidebar from "@/components/role-sidebar";
import { isAdminSession, isProfessorSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseStatus, supabase } from "@/lib/supabase";
import { appendAuditEntry, validateAcademicReservation } from "@/lib/academic-rules";

type ReservaRecord = {
  id_reserva: number;
  id_usuario: number;
  id_aula: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string | null;
  estado: string;
  usuarios?: { nombre?: string; apellido?: string; email?: string } | null;
  aulas?: { codigo_aula?: string; nombre_aula?: string } | null;
};

type FormState = {
  id_reserva: number | null;
  id_usuario: string;
  id_aula: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado: string;
};

const emptyForm: FormState = {
  id_reserva: null,
  id_usuario: "",
  id_aula: "",
  fecha: "",
  hora_inicio: "09:00",
  hora_fin: "11:00",
  motivo: "",
  estado: "Pendiente",
};

const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reservas", href: "/reservas" },
  { label: "Aulas", href: "/reservas" },
  { label: "Usuarios", href: "/registro" },
  { label: "Horarios", href: "/reservas" },
  { label: "Reportes", href: "/admin" },
  { label: "Salir", href: "/login" },
];

const fallbackLocalData: ReservaRecord[] = [
  {
    id_reserva: 1,
    id_usuario: 1,
    id_aula: 1,
    fecha_reserva: "2026-10-15",
    hora_inicio: "09:00",
    hora_fin: "11:00",
    motivo: "Clase de programación",
    estado: "Aprobada",
    usuarios: { nombre: "Admin", apellido: "Sistema", email: "admin@sistema.com" },
    aulas: { codigo_aula: "A-101", nombre_aula: "Aula 101" },
  },
  {
    id_reserva: 2,
    id_usuario: 2,
    id_aula: 2,
    fecha_reserva: "2026-10-16",
    hora_inicio: "12:00",
    hora_fin: "14:00",
    motivo: "Reunión de coordinación",
    estado: "Pendiente",
    usuarios: { nombre: "Ana", apellido: "Gómez", email: "ana.gomez@institucion.edu" },
    aulas: { codigo_aula: "LAB-2", nombre_aula: "Laboratorio 2" },
  },
];

export default function ReservasPage() {
  const router = useRouter();
  const [reservas, setReservas] = useState<ReservaRecord[]>([]);
  const [usuarios, setUsuarios] = useState<Array<Record<string, any>>>([]);
  const [aulas, setAulas] = useState<Array<Record<string, any>>>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const supabaseStatus = getSupabaseStatus();

  const role = typeof window !== "undefined" ? localStorage.getItem("session-role") : "Profesor";
  const currentUserId = typeof window !== "undefined" ? Number(localStorage.getItem("session-user-id") ?? 0) : 0;
  const isAdmin = role === "Superadministrador";
  const currentUser = usuarios.find((usuario) => Number(usuario.id_usuario) === Number(currentUserId));
  const currentUserName = currentUser
    ? `${currentUser.nombre ?? ""} ${currentUser.apellido ?? ""}`.trim()
    : (typeof window !== "undefined" ? localStorage.getItem("session-name") : null) || "Profesor";

  const professorUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const roleName = usuario.roles?.nombre_rol ?? (Number(usuario.id_rol) === 1 ? "Superadministrador" : "Profesor");
      return roleName === "Profesor";
    });
  }, [usuarios]);

  const normalizeText = (value: string | null | undefined) =>
    (value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const loadData = async () => {
    const savedReservas = JSON.parse(localStorage.getItem("demo-reservas") ?? "null") as ReservaRecord[] | null;
    const savedUsuarios = JSON.parse(localStorage.getItem("demo-usuarios") ?? "null") as Array<Record<string, any>> | null;
    const savedAulas = JSON.parse(localStorage.getItem("demo-aulas") ?? "null") as Array<Record<string, any>> | null;
    const currentUserIdFromStorage = Number(localStorage.getItem("session-user-id") ?? 0);
    const currentRole = localStorage.getItem("session-role") ?? "Profesor";

    if (!supabase) {
      const finalUsuarios = savedUsuarios?.length ? savedUsuarios : [
        { id_usuario: 1, nombre: "Admin", apellido: "Sistema", email: "admin@sistema.com" },
        { id_usuario: 2, nombre: "Ana", apellido: "Gómez", email: "ana.gomez@institucion.edu" },
      ];
      const finalAulas = savedAulas?.length ? savedAulas : [
        { id_aula: 1, codigo_aula: "A-101", nombre_aula: "Aula 101" },
        { id_aula: 2, codigo_aula: "LAB-2", nombre_aula: "Laboratorio 2" },
      ];
      const finalReservas = (savedReservas?.length ? savedReservas : fallbackLocalData).filter((reserva) => {
        if (currentRole === "Superadministrador") return true;
        return Number(reserva.id_usuario) === Number(currentUserIdFromStorage) || reserva.estado === "Aprobada";
      });
      localStorage.setItem("demo-usuarios", JSON.stringify(finalUsuarios));
      localStorage.setItem("demo-aulas", JSON.stringify(finalAulas));
      localStorage.setItem("demo-reservas", JSON.stringify(finalReservas));
      setReservas(finalReservas);
      setUsuarios(finalUsuarios);
      setAulas(finalAulas);
      return;
    }

    try {
      const reservasQuery = supabase
        .from("reservas")
        .select("*, usuarios!fk_reservas_usuarios(nombre, apellido, email), aulas!fk_reservas_aulas(codigo_aula, nombre_aula)")
        .order("fecha_reserva", { ascending: false });

      const [usuariosResult, aulasResult, reservasResult] = await Promise.all([
        supabase.from("usuarios").select("*").order("nombre", { ascending: true }),
        supabase.from("aulas").select("*").order("nombre_aula", { ascending: true }),
        reservasQuery,
      ]);

      if (usuariosResult.error || aulasResult.error || reservasResult.error) {
        throw usuariosResult.error ?? aulasResult.error ?? reservasResult.error ?? new Error("Sin datos disponibles");
      }

      const nextUsuarios = (usuariosResult.data as Array<Record<string, any>> | null)?.length ? (usuariosResult.data as Array<Record<string, any>>) : [
        { id_usuario: 1, nombre: "Admin", apellido: "Sistema", email: "admin@sistema.com" },
        { id_usuario: 2, nombre: "Ana", apellido: "Gómez", email: "ana.gomez@institucion.edu" },
      ];
      const nextAulas = (aulasResult.data as Array<Record<string, any>> | null)?.length ? (aulasResult.data as Array<Record<string, any>>) : [
        { id_aula: 1, codigo_aula: "A-101", nombre_aula: "Aula 101" },
        { id_aula: 2, codigo_aula: "LAB-2", nombre_aula: "Laboratorio 2" },
      ];
      const nextReservas = (reservasResult.data as ReservaRecord[] | null)?.length ? (reservasResult.data as ReservaRecord[]) : fallbackLocalData;
      const visibleReservas = currentRole === "Superadministrador"
        ? nextReservas
        : nextReservas.filter((reserva) => Number(reserva.id_usuario) === Number(currentUserIdFromStorage) || reserva.estado === "Aprobada");

      localStorage.setItem("demo-usuarios", JSON.stringify(nextUsuarios));
      localStorage.setItem("demo-aulas", JSON.stringify(nextAulas));
      localStorage.setItem("demo-reservas", JSON.stringify(visibleReservas));
      setReservas(visibleReservas);
      setUsuarios(nextUsuarios);
      setAulas(nextAulas);
    } catch (error) {
      const fallbackUsuariosData = savedUsuarios?.length ? savedUsuarios : [
        { id_usuario: 1, nombre: "Admin", apellido: "Sistema", email: "admin@sistema.com" },
        { id_usuario: 2, nombre: "Ana", apellido: "Gómez", email: "ana.gomez@institucion.edu" },
      ];
      const fallbackAulasData = savedAulas?.length ? savedAulas : [
        { id_aula: 1, codigo_aula: "A-101", nombre_aula: "Aula 101" },
        { id_aula: 2, codigo_aula: "LAB-2", nombre_aula: "Laboratorio 2" },
      ];
      const fallbackData = savedReservas?.length ? savedReservas : fallbackLocalData;
      const visibleFallback = currentRole === "Superadministrador"
        ? fallbackData
        : fallbackData.filter((reserva) => Number(reserva.id_usuario) === Number(currentUserIdFromStorage) || reserva.estado === "Aprobada");
      localStorage.setItem("demo-usuarios", JSON.stringify(fallbackUsuariosData));
      localStorage.setItem("demo-aulas", JSON.stringify(fallbackAulasData));
      localStorage.setItem("demo-reservas", JSON.stringify(visibleFallback));
      setReservas(visibleFallback);
      setUsuarios(fallbackUsuariosData);
      setAulas(fallbackAulasData);
      console.warn("Fallo en Supabase para reservas, usando datos demo.", error);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("session-role");

    if (!isProfessorSession() && !isAdminSession()) {
      router.replace("/login");
      return;
    }

    if (!isAdminSession() && role !== "Profesor") {
      router.replace("/login");
      return;
    }

    loadData();
  }, [router]);

  const visibleUsuarios = useMemo(() => {
    if (isAdmin) return professorUsuarios;
    return usuarios.filter((usuario) => Number(usuario.id_usuario) === Number(currentUserId));
  }, [usuarios, isAdmin, currentUserId, professorUsuarios]);

  const visibleReservas = useMemo(() => {
    if (isAdmin) return reservas;
    return reservas.filter((reserva) => Number(reserva.id_usuario) === Number(currentUserId) || reserva.estado === "Aprobada");
  }, [reservas, isAdmin, currentUserId]);

  const filteredReservas = useMemo(() => {
    const query = normalizeText(search);
    if (!query) return visibleReservas;

    return visibleReservas.filter((reserva) => {
      const haystack = [
        reserva.aulas?.nombre_aula ?? "",
        reserva.aulas?.codigo_aula ?? "",
        reserva.usuarios?.nombre ?? "",
        reserva.usuarios?.apellido ?? "",
        reserva.usuarios?.email ?? "",
        reserva.motivo ?? "",
        reserva.estado,
      ].join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [visibleReservas, search]);

  const getCurrentUserLabel = () => {
    const userName = currentUserName || "Profesor";
    return userName.trim() || "Profesor";
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const connectionStatus = getSupabaseStatus();
    const resolvedUserId = isAdmin ? Number(form.id_usuario) : Number(currentUserId || form.id_usuario || 0);

    const finalEstado = isAdmin ? form.estado : "Pendiente";

    const payload = {
      id_usuario: resolvedUserId,
      id_aula: Number(form.id_aula),
      fecha_reserva: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      motivo: form.motivo,
      estado: finalEstado,
    };

    try {
      if (resolvedUserId === 0 || !Number(form.id_aula)) {
        throw new Error("Debes seleccionar una aula y un usuario válido.");
      }

      const existingReservas = JSON.parse(localStorage.getItem("demo-reservas") ?? "[]") as ReservaRecord[];
      const validation = validateAcademicReservation({
        reservations: existingReservas.length ? existingReservas : reservas,
        selectedUserId: resolvedUserId,
        selectedAulaId: Number(form.id_aula),
        fecha: form.fecha,
        horaInicio: form.hora_inicio,
        horaFin: form.hora_fin,
        currentReservationId: form.id_reserva ?? undefined,
      });

      if (!validation.valid) {
        setMessage(validation.message);
        setSaving(false);
        return;
      }

      if (!supabase) {
        const selectedUser = usuarios.find((usuario) => Number(usuario.id_usuario) === Number(resolvedUserId)) ?? currentUser ?? null;
        const updated: ReservaRecord[] = form.id_reserva
          ? existingReservas.map((item) => (item.id_reserva === form.id_reserva ? { ...item, ...payload, id_reserva: item.id_reserva, estado: finalEstado } : item))
          : [{
              ...payload,
              id_reserva: Date.now(),
              usuarios: selectedUser
                ? { nombre: selectedUser.nombre ?? "", apellido: selectedUser.apellido ?? "", email: selectedUser.email ?? "" }
                : { nombre: "Docente", apellido: "Registrado", email: "" },
              aulas: { codigo_aula: "Aula", nombre_aula: "Aula" },
            } as ReservaRecord, ...existingReservas];

        if (!connectionStatus.enabled) {
          throw new Error(connectionStatus.message);
        }

        const nextReservas = updated.filter((item) => isAdmin || Number(item.id_usuario) === Number(currentUserId));
        localStorage.setItem("demo-reservas", JSON.stringify(nextReservas));
        appendAuditEntry({
          action: form.id_reserva ? "Actualización de reserva" : "Creación de reserva",
          summary: `Reserva ${form.id_reserva ? "actualizada" : "creada"} para ${selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido}`.trim() : getCurrentUserLabel()} en ${form.fecha} de ${form.hora_inicio} a ${form.hora_fin}`,
          userName: selectedUser ? `${selectedUser.nombre ?? ""} ${selectedUser.apellido ?? ""}`.trim() : getCurrentUserLabel(),
          userId: resolvedUserId,
          state: finalEstado,
          role: role ?? "Profesor",
          date: new Date().toISOString(),
        });
        setReservas(nextReservas);
        window.dispatchEvent(new Event("reservas-updated"));
      } else {
        if (form.id_reserva) {
          const { error } = await supabase.from("reservas").update(payload).eq("id_reserva", form.id_reserva);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("reservas").insert(payload);
          if (error) throw error;
        }
        appendAuditEntry({
          action: form.id_reserva ? "Actualización de reserva" : "Creación de reserva",
          summary: `Reserva ${form.id_reserva ? "actualizada" : "creada"} para ${getCurrentUserLabel()} en ${form.fecha} de ${form.hora_inicio} a ${form.hora_fin}`,
          userName: getCurrentUserLabel(),
          userId: resolvedUserId,
          state: finalEstado,
          role: role ?? "Profesor",
          date: new Date().toISOString(),
        });
        await loadData();
        window.dispatchEvent(new Event("reservas-updated"));
      }

      setMessage(form.id_reserva ? "Reserva actualizada correctamente." : "Reserva registrada correctamente.");
      setForm(emptyForm);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "No se pudo guardar la reserva. Revisa los datos o la conexión con Supabase.";
      setMessage(detail || "No se pudo guardar la reserva. Revisa los datos o la conexión con Supabase.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reserva: ReservaRecord) => {
    setForm({
      id_reserva: reserva.id_reserva,
      id_usuario: String(reserva.id_usuario ?? ""),
      id_aula: String(reserva.id_aula ?? ""),
      fecha: reserva.fecha_reserva,
      hora_inicio: reserva.hora_inicio,
      hora_fin: reserva.hora_fin,
      motivo: reserva.motivo ?? "",
      estado: reserva.estado,
    });
    setMessage("Editando reserva actual.");
  };

  return (
    <main className="page-shell">
      <RoleSidebar />

      <section className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Gestión</p>
            <h1>{isAdmin ? "Reservas" : "Mis reservas"}</h1>
          </div>
          <button className="primary-button" type="button" onClick={() => setForm(emptyForm)}>
            Nueva solicitud
          </button>
        </header>

        {!supabaseStatus.enabled ? (
          <div className="demo-banner" role="status" aria-live="polite">
            {supabaseStatus.message}
          </div>
        ) : null}

        <div className="reservas-controls">
          <div className="search-box">
            <span>Buscar</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar aula, docente o motivo"
            />
          </div>
        </div>

        <div className="booking-grid">
          <form className="form-card" onSubmit={handleSubmit}>
            <h3>{form.id_reserva ? "Editar reserva" : "Registrar reserva"}</h3>

            <div className="form-grid">
              {isAdmin ? (
                <label>
                  Usuario
                  <select value={form.id_usuario} onChange={(event) => handleChange("id_usuario", event.target.value)}>
                    <option value="">Selecciona usuario</option>
                    {visibleUsuarios.map((usuario) => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {usuario.nombre} {usuario.apellido}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label>
                  Usuario
                  <input value={currentUserName} readOnly />
                </label>
              )}

              <label>
                Aula
                <select value={form.id_aula} onChange={(event) => handleChange("id_aula", event.target.value)}>
                  <option value="">Selecciona aula</option>
                  {aulas.map((aula) => (
                    <option key={aula.id_aula} value={aula.id_aula}>
                      {aula.nombre_aula} ({aula.codigo_aula})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Fecha
                <input type="date" value={form.fecha} onChange={(event) => handleChange("fecha", event.target.value)} />
              </label>

              <label>
                Hora inicio
                <input type="time" value={form.hora_inicio} onChange={(event) => handleChange("hora_inicio", event.target.value)} />
              </label>

              <label>
                Hora fin
                <input type="time" value={form.hora_fin} onChange={(event) => handleChange("hora_fin", event.target.value)} />
              </label>

              <label>
                Estado
                {isAdmin ? (
                  <select value={form.estado} onChange={(event) => handleChange("estado", event.target.value)}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                ) : (
                  <input value={form.estado || "Pendiente"} readOnly />
                )}
              </label>

              <label className="full-width">
                Motivo
                <textarea
                  value={form.motivo}
                  onChange={(event) => handleChange("motivo", event.target.value)}
                  placeholder="Ej: Clase de laboratorio, reunión académica, etc."
                />
              </label>
            </div>

            {message ? <p className="form-feedback">{message}</p> : null}

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? "Guardando..." : form.id_reserva ? "Guardar cambios" : "Registrar reserva"}
              </button>
              {form.id_reserva ? (
                <button className="secondary-button" type="button" onClick={() => setForm(emptyForm)}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <div className="table-card">
            <div className="table-header">
              <h3>Listado</h3>
              <span>{filteredReservas.length} registros</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Aula</th>
                    <th>Docente</th>
                    <th>Horario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservas.length ? (
                    filteredReservas.map((reserva) => (
                      <tr key={reserva.id_reserva}>
                        <td>{reserva.aulas?.nombre_aula ?? "Sin aula"}</td>
                        <td>
                          {reserva.usuarios?.nombre ?? ""} {reserva.usuarios?.apellido ?? ""}
                        </td>
                        <td>
                          {reserva.fecha_reserva} · {reserva.hora_inicio} - {reserva.hora_fin}
                        </td>
                        <td>
                          <span className={`status ${reserva.estado.toLowerCase()}`}>
                            {reserva.estado}
                          </span>
                        </td>
                        <td>
                          <button className="ghost-button" type="button" onClick={() => handleEdit(reserva)}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="empty-state">
                        No se encontraron resultados para esta búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
