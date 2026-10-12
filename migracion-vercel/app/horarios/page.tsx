"use client";

import RoleSidebar from "@/components/role-sidebar";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type HorarioRecord = {
  id_horario: number;
  id_usuario: number;
  id_aula: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  usuarios?: { nombre?: string; apellido?: string } | null;
  aulas?: { nombre_aula?: string; codigo_aula?: string } | null;
};

type FormState = {
  id_horario: number | null;
  id_usuario: string;
  id_aula: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
};

const emptyForm: FormState = {
  id_horario: null,
  id_usuario: "",
  id_aula: "",
  dia_semana: "Lunes",
  hora_inicio: "08:00",
  hora_fin: "10:00",
};

const fallbackHorarios: HorarioRecord[] = [
  { id_horario: 1, id_usuario: 2, id_aula: 1, dia_semana: "Lunes", hora_inicio: "08:00", hora_fin: "10:00", usuarios: { nombre: "Profesor", apellido: "Demo" }, aulas: { nombre_aula: "Aula 101", codigo_aula: "A-101" } },
  { id_horario: 2, id_usuario: 2, id_aula: 2, dia_semana: "Miércoles", hora_inicio: "12:00", hora_fin: "14:00", usuarios: { nombre: "Profesor", apellido: "Demo" }, aulas: { nombre_aula: "Laboratorio 2", codigo_aula: "LAB-2" } },
];

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<HorarioRecord[]>([]);
  const [usuarios, setUsuarios] = useState<Array<Record<string, any>>>([]);
  const [aulas, setAulas] = useState<Array<Record<string, any>>>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const normalizeText = (value: string | null | undefined) =>
    (value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const loadData = async () => {
    const savedHorarios = JSON.parse(localStorage.getItem("demo-horarios") ?? "null") as HorarioRecord[] | null;
    const savedUsuarios = JSON.parse(localStorage.getItem("demo-usuarios") ?? "null") as Array<Record<string, any>> | null;
    const savedAulas = JSON.parse(localStorage.getItem("demo-aulas") ?? "null") as Array<Record<string, any>> | null;

    if (!supabase) {
      const finalUsuarios = savedUsuarios?.length ? savedUsuarios : [{ id_usuario: 2, nombre: "Profesor", apellido: "Demo" }];
      const finalAulas = savedAulas?.length ? savedAulas : [{ id_aula: 1, nombre_aula: "Aula 101", codigo_aula: "A-101" }, { id_aula: 2, nombre_aula: "Laboratorio 2", codigo_aula: "LAB-2" }];
      const finalHorarios = savedHorarios?.length ? savedHorarios : fallbackHorarios;
      localStorage.setItem("demo-usuarios", JSON.stringify(finalUsuarios));
      localStorage.setItem("demo-aulas", JSON.stringify(finalAulas));
      localStorage.setItem("demo-horarios", JSON.stringify(finalHorarios));
      setUsuarios(finalUsuarios);
      setAulas(finalAulas);
      setHorarios(finalHorarios);
      return;
    }

    try {
      const [usuariosResult, aulasResult, horariosResult] = await Promise.all([
        supabase.from("usuarios").select("*"),
        supabase.from("aulas").select("*"),
        supabase.from("horarios_docentes").select("*, usuarios(nombre, apellido), aulas(nombre_aula, codigo_aula)").order("dia_semana", { ascending: true }),
      ]);

      if (usuariosResult.error || aulasResult.error || horariosResult.error) {
        throw usuariosResult.error ?? aulasResult.error ?? horariosResult.error ?? new Error("Sin datos disponibles");
      }

      const nextUsuarios = (usuariosResult.data as Array<Record<string, any>> | null)?.length ? (usuariosResult.data as Array<Record<string, any>>) : [{ id_usuario: 2, nombre: "Profesor", apellido: "Demo" }];
      const nextAulas = (aulasResult.data as Array<Record<string, any>> | null)?.length ? (aulasResult.data as Array<Record<string, any>>) : [{ id_aula: 1, nombre_aula: "Aula 101", codigo_aula: "A-101" }, { id_aula: 2, nombre_aula: "Laboratorio 2", codigo_aula: "LAB-2" }];
      const nextHorarios = (horariosResult.data as HorarioRecord[] | null)?.length ? (horariosResult.data as HorarioRecord[]) : fallbackHorarios;

      localStorage.setItem("demo-usuarios", JSON.stringify(nextUsuarios));
      localStorage.setItem("demo-aulas", JSON.stringify(nextAulas));
      localStorage.setItem("demo-horarios", JSON.stringify(nextHorarios));
      setUsuarios(nextUsuarios);
      setAulas(nextAulas);
      setHorarios(nextHorarios);
    } catch (error) {
      const fallbackUsuariosData = savedUsuarios?.length ? savedUsuarios : [{ id_usuario: 2, nombre: "Profesor", apellido: "Demo" }];
      const fallbackAulasData = savedAulas?.length ? savedAulas : [{ id_aula: 1, nombre_aula: "Aula 101", codigo_aula: "A-101" }, { id_aula: 2, nombre_aula: "Laboratorio 2", codigo_aula: "LAB-2" }];
      const fallbackData = savedHorarios?.length ? savedHorarios : fallbackHorarios;
      localStorage.setItem("demo-usuarios", JSON.stringify(fallbackUsuariosData));
      localStorage.setItem("demo-aulas", JSON.stringify(fallbackAulasData));
      localStorage.setItem("demo-horarios", JSON.stringify(fallbackData));
      setUsuarios(fallbackUsuariosData);
      setAulas(fallbackAulasData);
      setHorarios(fallbackData);
      console.warn("Fallo en Supabase para horarios, usando datos demo.", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const query = normalizeText(search);
    if (!query) return horarios;

    return horarios.filter((horario) => {
      const haystack = [
        horario.dia_semana,
        horario.usuarios?.nombre ?? "",
        horario.usuarios?.apellido ?? "",
        horario.aulas?.nombre_aula ?? "",
        horario.aulas?.codigo_aula ?? "",
      ].join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [horarios, search]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      id_usuario: Number(form.id_usuario),
      id_aula: Number(form.id_aula),
      dia_semana: form.dia_semana,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
    };

    try {
      if (!supabase) {
        const current = JSON.parse(localStorage.getItem("demo-horarios") ?? "[]") as HorarioRecord[];
        const updated = form.id_horario
          ? current.map((item) => (item.id_horario === form.id_horario ? { ...item, ...payload, id_horario: item.id_horario } : item))
          : [{ ...payload, id_horario: Date.now(), usuarios: { nombre: "Docente", apellido: "Nuevo" }, aulas: { nombre_aula: "Aula", codigo_aula: "N/A" } }, ...current];
        localStorage.setItem("demo-horarios", JSON.stringify(updated));
        setHorarios(updated);
      } else {
        if (form.id_horario) {
          const { error } = await supabase.from("horarios_docentes").update(payload).eq("id_horario", form.id_horario);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("horarios_docentes").insert(payload);
          if (error) throw error;
        }
        await loadData();
      }

      setMessage(form.id_horario ? "Horario actualizado correctamente." : "Horario registrado correctamente.");
      setForm(emptyForm);
    } catch (error) {
      setMessage("No se pudo guardar el horario.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (horario: HorarioRecord) => {
    setForm({
      id_horario: horario.id_horario,
      id_usuario: String(horario.id_usuario ?? ""),
      id_aula: String(horario.id_aula ?? ""),
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
    });
    setMessage("Editando horario seleccionado.");
  };

  return (
    <main className="page-shell">
      <RoleSidebar />

      <section className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Administración</p>
            <h1>Horarios</h1>
          </div>
          <button className="primary-button" type="button" onClick={() => setForm(emptyForm)}>
            Nuevo horario
          </button>
        </header>

        <div className="reservas-controls">
          <div className="search-box">
            <span>Buscar</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Docente, aula o día" />
          </div>
        </div>

        <div className="booking-grid">
          <form className="form-card" onSubmit={handleSubmit}>
            <h3>{form.id_horario ? "Editar horario" : "Registrar horario"}</h3>

            <div className="form-grid">
              <label>
                Docente
                <select value={form.id_usuario} onChange={(event) => handleChange("id_usuario", event.target.value)}>
                  <option value="">Selecciona docente</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>{usuario.nombre} {usuario.apellido}</option>
                  ))}
                </select>
              </label>

              <label>
                Aula
                <select value={form.id_aula} onChange={(event) => handleChange("id_aula", event.target.value)}>
                  <option value="">Selecciona aula</option>
                  {aulas.map((aula) => (
                    <option key={aula.id_aula} value={aula.id_aula}>{aula.nombre_aula}</option>
                  ))}
                </select>
              </label>

              <label>
                Día
                <select value={form.dia_semana} onChange={(event) => handleChange("dia_semana", event.target.value)}>
                  {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map((dia) => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
              </label>

              <label>
                Hora inicio
                <input type="time" value={form.hora_inicio} onChange={(event) => handleChange("hora_inicio", event.target.value)} />
              </label>

              <label>
                Hora fin
                <input type="time" value={form.hora_fin} onChange={(event) => handleChange("hora_fin", event.target.value)} />
              </label>
            </div>

            {message ? <p className="form-feedback">{message}</p> : null}

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Guardando..." : form.id_horario ? "Actualizar" : "Guardar"}
              </button>
              <button type="button" className="secondary-button" onClick={() => setForm(emptyForm)}>
                Limpiar
              </button>
            </div>
          </form>

          <div className="table-card">
            <div className="table-header">
              <h3>Horario docente</h3>
              <span>{filtered.length} registros</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Docente</th>
                    <th>Aula</th>
                    <th>Día</th>
                    <th>Horario</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((horario) => (
                    <tr key={horario.id_horario}>
                      <td>{horario.usuarios?.nombre ?? ""} {horario.usuarios?.apellido ?? ""}</td>
                      <td>{horario.aulas?.nombre_aula ?? ""}</td>
                      <td>{horario.dia_semana}</td>
                      <td>{horario.hora_inicio} - {horario.hora_fin}</td>
                      <td><button type="button" className="ghost-button" onClick={() => handleEdit(horario)}>Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
