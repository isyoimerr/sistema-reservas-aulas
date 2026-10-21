"use client";

import RoleSidebar from "@/components/role-sidebar";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  adaptExtractedHorario,
  extractDocenteNameFromText,
  extractPdfMetadata,
  extractPrimaryProfesorFromText,
  extractTextFromPdf,
  type HorarioPayload,
} from "@/lib/horario-extractor";

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

const normalizeText = (value: string | null | undefined) =>
  (value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const fallbackHorarios: HorarioRecord[] = [
  { id_horario: 1, id_usuario: 2, id_aula: 1, dia_semana: "Lunes", hora_inicio: "08:00", hora_fin: "10:00", usuarios: { nombre: "Profesor", apellido: "Asignado" }, aulas: { nombre_aula: "Aula 101", codigo_aula: "A-101" } },
  { id_horario: 2, id_usuario: 2, id_aula: 2, dia_semana: "Miércoles", hora_inicio: "12:00", hora_fin: "14:00", usuarios: { nombre: "Profesor", apellido: "Asignado" }, aulas: { nombre_aula: "Laboratorio 2", codigo_aula: "LAB-2" } },
  { id_horario: 3, id_usuario: 3, id_aula: 3, dia_semana: "Viernes", hora_inicio: "07:00", hora_fin: "09:00", usuarios: { nombre: "Ana", apellido: "Gómez" }, aulas: { nombre_aula: "Salón de grados", codigo_aula: "SAL-3" } },
];

const getLocalStorageJson = <T,>(key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
};

const saveHorariosToLocal = (records: HorarioRecord[]) => {
  localStorage.setItem("cache-horarios", JSON.stringify(records));
};

const saveSingleHorario = async (payload: { id_usuario: number; id_aula: number; dia_semana: string; hora_inicio: string; hora_fin: string }) => {
  if (!supabase) {
    const current = getLocalStorageJson<HorarioRecord[]>("cache-horarios") ?? [];
    const actualUsuarios = getLocalStorageJson<Array<Record<string, any>>>("cache-usuarios") ?? [];
    const actualAulas = getLocalStorageJson<Array<Record<string, any>>>("cache-aulas") ?? [];
    const display = resolveHorarioDisplay(payload.id_usuario, payload.id_aula, actualUsuarios, actualAulas);

    const next: HorarioRecord = {
      id_horario: Date.now(),
      id_usuario: payload.id_usuario,
      id_aula: payload.id_aula,
      dia_semana: payload.dia_semana,
      hora_inicio: payload.hora_inicio,
      hora_fin: payload.hora_fin,
      usuarios: { nombre: display.usuario.nombre, apellido: display.usuario.apellido },
      aulas: { nombre_aula: display.aula.nombre_aula, codigo_aula: display.aula.codigo_aula },
    };
    const updated = [next, ...current];
    saveHorariosToLocal(updated);
    return updated;
  }

  const { error } = await supabase.from("horarios_docentes").insert({
    id_usuario: payload.id_usuario,
    id_aula: payload.id_aula,
    dia_semana: payload.dia_semana,
    hora_inicio: payload.hora_inicio,
    hora_fin: payload.hora_fin,
  });

  if (error) {
    throw error;
  }

  return null;
};

const getProfessorLabel = (usuario?: Record<string, any> | null) => {
  if (!usuario) return "Sin profesor";
  return `${usuario.nombre ?? ""} ${usuario.apellido ?? ""}`.trim() || usuario.email || "Profesor";
};

const matchPersonaNombre = (input: string, candidate: string) =>
  normalizeText(input) === normalizeText(candidate) || normalizeText(input).includes(normalizeText(candidate)) || normalizeText(candidate).includes(normalizeText(input));

const buildEmailFromNombre = (nombreCompleto: string) => {
  const compact = normalizeText(nombreCompleto).replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
  return compact ? `${compact}@institucion.edu` : "docente@institucion.edu";
};

const resolveHorarioDisplay = (idUsuario: number | null, idAula: number | null, currentUsuarios: Array<Record<string, any>>, currentAulas: Array<Record<string, any>>) => {
  const profesor = currentUsuarios.find((usuario) => Number(usuario.id_usuario) === Number(idUsuario));
  const aula = currentAulas.find((room) => Number(room.id_aula) === Number(idAula));

  return {
    usuario: profesor ?? { nombre: "Docente", apellido: "Sistema" },
    aula: aula ?? { nombre_aula: "Aula asignada", codigo_aula: "SISTEMA" },
  };
};

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<HorarioRecord[]>([]);
  const [usuarios, setUsuarios] = useState<Array<Record<string, any>>>([]);
  const [aulas, setAulas] = useState<Array<Record<string, any>>>([]);
  const [search, setSearch] = useState("");
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>("");
  const role = typeof window !== "undefined" ? localStorage.getItem("session-role") : "Profesor";
  const currentUserId = typeof window !== "undefined" ? Number(localStorage.getItem("session-user-id") ?? 0) : 0;
  const isAdmin = role === "Superadministrador";
  const currentUser = usuarios.find((usuario) => Number(usuario.id_usuario) === Number(currentUserId));
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const [parsedHorarios, setParsedHorarios] = useState<HorarioPayload[]>([]);

  const loadData = async () => {
    const savedHorarios = getLocalStorageJson<HorarioRecord[]>("cache-horarios");
    const savedUsuarios = getLocalStorageJson<Array<Record<string, any>>>("cache-usuarios");
    const savedAulas = getLocalStorageJson<Array<Record<string, any>>>("cache-aulas");
    const currentRole = localStorage.getItem("session-role") ?? "Profesor";
    const currentUserIdFromStorage = Number(localStorage.getItem("session-user-id") ?? 0);

    if (!supabase) {
      const finalUsuarios = savedUsuarios?.length ? savedUsuarios : [
        { id_usuario: 2, nombre: "Profesor", apellido: "Asignado", email: "profesor@sistema.com" },
        { id_usuario: 3, nombre: "Ana", apellido: "Gómez", email: "ana.gomez@institucion.edu" },
      ];
      const finalAulas = savedAulas?.length ? savedAulas : [
        { id_aula: 1, nombre_aula: "Aula 101", codigo_aula: "A-101" },
        { id_aula: 2, nombre_aula: "Laboratorio 2", codigo_aula: "LAB-2" },
        { id_aula: 3, nombre_aula: "Salón de grados", codigo_aula: "SAL-3" },
      ];
      const finalHorarios = (savedHorarios?.length ? savedHorarios : fallbackHorarios).filter((horario) => {
        if (currentRole === "Superadministrador") return true;
        return Number(horario.id_usuario) === Number(currentUserIdFromStorage);
      });
      localStorage.setItem("cache-usuarios", JSON.stringify(finalUsuarios));
      localStorage.setItem("cache-aulas", JSON.stringify(finalAulas));
      localStorage.setItem("cache-horarios", JSON.stringify(finalHorarios));
      setUsuarios(finalUsuarios);
      setAulas(finalAulas);
      setHorarios(finalHorarios);
      setSelectedProfessorId(currentRole === "Superadministrador" ? "" : String(currentUserIdFromStorage || ""));
      return;
    }

    try {
      const horariosQuery = currentRole === "Superadministrador"
        ? supabase.from("horarios_docentes").select("*, usuarios(nombre, apellido, email), aulas(nombre_aula, codigo_aula)").order("dia_semana", { ascending: true })
        : supabase.from("horarios_docentes").select("*, usuarios(nombre, apellido, email), aulas(nombre_aula, codigo_aula)").eq("id_usuario", Number(currentUserIdFromStorage)).order("dia_semana", { ascending: true });

      const [usuariosResult, aulasResult, horariosResult] = await Promise.all([
        supabase.from("usuarios").select("*").order("nombre", { ascending: true }),
        supabase.from("aulas").select("*").order("nombre_aula", { ascending: true }),
        horariosQuery,
      ]);

      if (usuariosResult.error || aulasResult.error || horariosResult.error) {
        throw usuariosResult.error ?? aulasResult.error ?? horariosResult.error ?? new Error("Sin datos disponibles");
      }

      const nextUsuarios = (usuariosResult.data as Array<Record<string, any>> | null)?.length ? (usuariosResult.data as Array<Record<string, any>>) : [
        { id_usuario: 2, nombre: "Profesor", apellido: "Asignado", email: "profesor@sistema.com" },
        { id_usuario: 3, nombre: "Ana", apellido: "Gómez", email: "ana.gomez@institucion.edu" },
      ];
      const nextAulas = (aulasResult.data as Array<Record<string, any>> | null)?.length ? (aulasResult.data as Array<Record<string, any>>) : [
        { id_aula: 1, nombre_aula: "Aula 101", codigo_aula: "A-101" },
        { id_aula: 2, nombre_aula: "Laboratorio 2", codigo_aula: "LAB-2" },
        { id_aula: 3, nombre_aula: "Salón de grados", codigo_aula: "SAL-3" },
      ];
      const nextHorarios = (horariosResult.data as HorarioRecord[] | null)?.length ? (horariosResult.data as HorarioRecord[]) : fallbackHorarios;
      const visibleHorarios = currentRole === "Superadministrador"
        ? nextHorarios
        : nextHorarios.filter((horario) => Number(horario.id_usuario) === Number(currentUserIdFromStorage));

      localStorage.setItem("cache-usuarios", JSON.stringify(nextUsuarios));
      localStorage.setItem("cache-aulas", JSON.stringify(nextAulas));
      localStorage.setItem("cache-horarios", JSON.stringify(visibleHorarios));
      setUsuarios(nextUsuarios);
      setAulas(nextAulas);
      setHorarios(visibleHorarios);
      setSelectedProfessorId(currentRole === "Superadministrador" ? "" : String(currentUserIdFromStorage || ""));
    } catch (error) {
      const fallbackUsuariosData = savedUsuarios?.length ? savedUsuarios : [
        { id_usuario: 2, nombre: "Profesor", apellido: "Asignado", email: "profesor@sistema.com" },
        { id_usuario: 3, nombre: "Ana", apellido: "Gómez", email: "ana.gomez@institucion.edu" },
      ];
      const fallbackAulasData = savedAulas?.length ? savedAulas : [
        { id_aula: 1, nombre_aula: "Aula 101", codigo_aula: "A-101" },
        { id_aula: 2, nombre_aula: "Laboratorio 2", codigo_aula: "LAB-2" },
        { id_aula: 3, nombre_aula: "Salón de grados", codigo_aula: "SAL-3" },
      ];
      const fallbackData = savedHorarios?.length ? savedHorarios : fallbackHorarios;
      const visibleFallback = currentRole === "Superadministrador"
        ? fallbackData
        : fallbackData.filter((horario) => Number(horario.id_usuario) === Number(currentUserIdFromStorage));
      localStorage.setItem("cache-usuarios", JSON.stringify(fallbackUsuariosData));
      localStorage.setItem("cache-aulas", JSON.stringify(fallbackAulasData));
      localStorage.setItem("cache-horarios", JSON.stringify(visibleFallback));
      setUsuarios(fallbackUsuariosData);
      setAulas(fallbackAulasData);
      setHorarios(visibleFallback);
      setSelectedProfessorId(currentRole === "Superadministrador" ? "" : String(currentUserIdFromStorage || ""));
      console.warn("Fallo en Supabase para horarios.", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const visibleHorarios = useMemo(() => {
    if (isAdmin) return horarios;
    return horarios.filter((horario) => Number(horario.id_usuario) === Number(currentUserId));
  }, [horarios, isAdmin, currentUserId]);

  const filtered = useMemo(() => {
    const query = normalizeText(search);
    if (!query) return visibleHorarios;

    return visibleHorarios.filter((horario) => {
      const haystack = [
        horario.dia_semana,
        horario.usuarios?.nombre ?? "",
        horario.usuarios?.apellido ?? "",
        horario.aulas?.nombre_aula ?? "",
        horario.aulas?.codigo_aula ?? "",
      ].join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [visibleHorarios, search]);

  const teacherSchedule = useMemo(() => {
    if (!selectedProfessorId) return [];
    return visibleHorarios.filter((horario) => Number(horario.id_usuario) === Number(selectedProfessorId));
  }, [visibleHorarios, selectedProfessorId]);

  const hydrateFormFromExtracted = (items: HorarioPayload[]) => {
    if (!items.length) return;
    const first = items[0];
    setForm({
      id_horario: null,
      id_usuario: String(first.id_usuario),
      id_aula: String(first.id_aula),
      dia_semana: first.dia_semana,
      hora_inicio: first.hora_inicio,
      hora_fin: first.hora_fin,
    });
    setSelectedProfessorId(String(first.id_usuario));
  };

  const ensureProfessorFromPdf = async (nombreCompleto: string, metadata?: ReturnType<typeof extractPdfMetadata>) => {
    if (!nombreCompleto.trim()) {
      return { usuario: usuarios[0] ?? null, created: false, message: "" };
    }

    const normalizedNombre = nombreCompleto.trim();
    const nombreParts = normalizedNombre.split(/\s+/);
    const nombre = nombreParts[0] ?? "Docente";
    const apellido = nombreParts.slice(1).join(" ") || "PDF";
    const email = metadata?.email || buildEmailFromNombre(normalizedNombre);

    const existing = usuarios.find((usuario) => {
      const nombreUsuario = `${usuario.nombre ?? ""} ${usuario.apellido ?? ""}`.trim();
      const sameName = matchPersonaNombre(normalizedNombre, nombreUsuario);
      const sameEmail = metadata?.email ? normalizeText(usuario.email ?? "") === normalizeText(metadata.email) : false;
      return sameName || sameEmail || matchPersonaNombre(normalizedNombre, usuario.email ?? "");
    });

    if (existing) {
      if (metadata?.email && existing.email !== metadata.email) {
        const mergedUsuario = {
          ...existing,
          email: metadata.email,
          nombre: existing.nombre || nombre,
          apellido: existing.apellido || apellido,
        };

        const updatedUsuarios = usuarios.map((usuario) =>
          Number(usuario.id_usuario) === Number(existing.id_usuario) ? mergedUsuario : usuario
        );

        setUsuarios(updatedUsuarios);
        localStorage.setItem("cache-usuarios", JSON.stringify(updatedUsuarios));

        if (supabase) {
          await supabase.from("usuarios").update({
            nombre: mergedUsuario.nombre,
            apellido: mergedUsuario.apellido,
            email: mergedUsuario.email,
          }).eq("id_usuario", existing.id_usuario);
          await loadData();
        }
      }

      return { usuario: existing, created: false, message: `Se actualizó el docente ${getProfessorLabel(existing)} con los datos del PDF.` };
    }

    const createdUser = {
      id_usuario: Date.now(),
      nombre,
      apellido,
      email,
      password: "123456",
      id_rol: 2,
      estado: "Activo",
      roles: { nombre_rol: "Profesor" },
    };

    const nextUsuarios = [createdUser, ...usuarios];
    setUsuarios(nextUsuarios);
    localStorage.setItem("cache-usuarios", JSON.stringify(nextUsuarios));

    if (supabase) {
      const { error } = await supabase.from("usuarios").insert({
        nombre,
        apellido,
        email,
        password: "123456",
        id_rol: 2,
        estado: "Activo",
      });
      if (error) {
        console.warn("No se pudo guardar el docente nuevo en Supabase:", error);
      } else {
        await loadData();
      }
    }

    return { usuario: createdUser, created: true, message: `Se creó automáticamente el docente ${nombre} ${apellido}.` };
  };

  const ensureAulaFromPdf = async (nombreAula: string) => {
    if (!nombreAula.trim()) {
      return { aula: aulas[0] ?? null, created: false, message: "" };
    }

    const existing = aulas.find((aula) => {
      const haystack = `${aula.codigo_aula ?? ""} ${aula.nombre_aula ?? ""}`;
      return matchPersonaNombre(nombreAula, haystack) || matchPersonaNombre(nombreAula, aula.codigo_aula ?? "");
    });

    if (existing) {
      return { aula: existing, created: false, message: `Se encontró el aula ${existing.nombre_aula}.` };
    }

    const normalizedNombre = nombreAula.trim();
    const codigo = normalizedNombre.match(/[A-Z0-9-]+/i)?.[0]?.toUpperCase() || `A-${Date.now().toString().slice(-4)}`;
    const createdAula = {
      id_aula: Date.now(),
      codigo_aula: codigo,
      nombre_aula: normalizedNombre,
      capacidad: 30,
      equipamiento: "Proyector",
      estado: "Activo",
    };

    const nextAulas = [createdAula, ...aulas];
    setAulas(nextAulas);
    localStorage.setItem("cache-aulas", JSON.stringify(nextAulas));

    if (supabase) {
      const { error } = await supabase.from("aulas").insert({
        codigo_aula: codigo,
        nombre_aula: normalizedNombre,
        capacidad: 30,
        equipamiento: "Proyector",
        estado: "Activo",
      });
      if (error) {
        console.warn("No se pudo guardar el aula nueva en Supabase:", error);
      } else {
        await loadData();
      }
    }

    return { aula: createdAula, created: true, message: `Se creó automáticamente el aula ${normalizedNombre}.` };
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const hasDuplicateHorario = (
    payload: { id_usuario: number; id_aula: number; dia_semana: string; hora_inicio: string; hora_fin: string },
    ignoreHorarioId?: number | null
  ) => {
    const exactMatch = horarios.some((horario) => {
      if (ignoreHorarioId && Number(horario.id_horario) === Number(ignoreHorarioId)) {
        return false;
      }
      return Number(horario.id_usuario) === Number(payload.id_usuario) &&
        Number(horario.id_aula) === Number(payload.id_aula) &&
        horario.dia_semana === payload.dia_semana &&
        horario.hora_inicio === payload.hora_inicio &&
        horario.hora_fin === payload.hora_fin;
    });

    return exactMatch;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const resolvedIdUsuario = isAdmin ? Number(form.id_usuario) || Number(usuarios[0]?.id_usuario ?? 0) : Number(currentUserId || form.id_usuario || usuarios[0]?.id_usuario || 0);
    const resolvedIdAula = Number(form.id_aula) || Number(aulas[0]?.id_aula ?? 0);

    const payload = {
      id_usuario: resolvedIdUsuario,
      id_aula: resolvedIdAula,
      dia_semana: form.dia_semana,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
    };

    try {
      if (!payload.id_usuario || !payload.id_aula) {
        throw new Error("No hay profesores o aulas disponibles para registrar el horario.");
      }

      if (hasDuplicateHorario(payload, form.id_horario ?? null)) {
        throw new Error("Ya existe ese horario para ese docente y aula en ese día y horario.");
      }

      if (!supabase) {
        const current = getLocalStorageJson<HorarioRecord[]>("cache-horarios") ?? [];
        const display = resolveHorarioDisplay(payload.id_usuario, payload.id_aula, usuarios, aulas);
        const updated = form.id_horario
          ? current.map((item) => (item.id_horario === form.id_horario ? { ...item, ...payload, id_horario: item.id_horario, usuarios: { nombre: display.usuario.nombre, apellido: display.usuario.apellido }, aulas: { nombre_aula: display.aula.nombre_aula, codigo_aula: display.aula.codigo_aula } } : item))
          : [{ ...payload, id_horario: Date.now(), usuarios: { nombre: display.usuario.nombre, apellido: display.usuario.apellido }, aulas: { nombre_aula: display.aula.nombre_aula, codigo_aula: display.aula.codigo_aula } }, ...current];
        const filteredUpdated = updated.filter((item) => isAdmin || Number(item.id_usuario) === Number(currentUserId));
        saveHorariosToLocal(filteredUpdated);
        setHorarios(filteredUpdated);
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
      setSelectedProfessorId(String(payload.id_usuario));
      setForm(emptyForm);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el horario.");
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
    setSelectedProfessorId(String(horario.id_usuario));
    setMessage("Editando horario seleccionado.");
  };

  const handleDelete = async (id_horario: number) => {
    if (!id_horario) return;
    const confirmed = window.confirm("¿Seguro que quieres eliminar este horario?");
    if (!confirmed) return;

    try {
      if (!supabase) {
        const current = getLocalStorageJson<HorarioRecord[]>("cache-horarios") ?? [];
        const updated = current.filter((item) => item.id_horario !== id_horario);
        saveHorariosToLocal(updated);
        setHorarios(updated);
      } else {
        const { error } = await supabase.from("horarios_docentes").delete().eq("id_horario", id_horario);
        if (error) throw error;
        await loadData();
      }
      setMessage("Horario eliminado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar el horario.");
      console.error(error);
    }
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPdfBusy(true);
    setMessage("");
    try {
      const text = await extractTextFromPdf(file);
      setPdfText(text);

      const mappedUsuarios = usuarios.map((usuario) => ({
        id_usuario: Number(usuario.id_usuario),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
      }));
      const mappedAulas = aulas.map((aula) => ({
        id_aula: Number(aula.id_aula),
        codigo_aula: aula.codigo_aula,
        nombre_aula: aula.nombre_aula,
      }));

      const pdfMetadata = extractPdfMetadata(text);
      const docenteNombre = extractDocenteNameFromText(text);
      const docentePrincipal = extractPrimaryProfesorFromText(text, mappedUsuarios) ?? mappedUsuarios[0];
      const docenteResolved = docenteNombre ? await ensureProfessorFromPdf(docenteNombre, pdfMetadata) : { usuario: docentePrincipal ?? usuarios[0] ?? null, created: false, message: "" };

      const extracted = adaptExtractedHorario(text, mappedUsuarios, mappedAulas);

      const resolvedProfessorId = docenteResolved.usuario?.id_usuario ?? extracted[0]?.id_usuario ?? Number(usuarios[0]?.id_usuario ?? 0);
      const resolvedAulaId = extracted[0]?.id_aula ?? Number(aulas[0]?.id_aula ?? 0);

      setParsedHorarios(extracted);
      setForm({
        id_horario: null,
        id_usuario: String(resolvedProfessorId || ""),
        id_aula: String(resolvedAulaId || ""),
        dia_semana: extracted[0]?.dia_semana ?? "Lunes",
        hora_inicio: extracted[0]?.hora_inicio ?? "08:00",
        hora_fin: extracted[0]?.hora_fin ?? "10:00",
      });
      setSelectedProfessorId("");

      if (extracted.length) {
        const detailMessage = docenteResolved.message || `Se detectaron ${extracted.length} horarios automáticamente en el PDF.`;
        setMessage(detailMessage);
        await persistParsedHorarios(extracted);
        return;
      }

      setMessage(docenteResolved.message || "El PDF se leyó y se preparó la carga, pero no coincidió con los nombres del sistema.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible procesar el PDF.");
      setPdfText("");
      setParsedHorarios([]);
      console.error(error);
    } finally {
      setPdfBusy(false);
    }
  };

  const persistParsedHorarios = async (scheduleToPersist: HorarioPayload[] = parsedHorarios) => {
    if (!scheduleToPersist.length) {
      setMessage("No hay horarios detectados para guardar.");
      return;
    }

    setSaving(true);
    try {
      const deduplicated: HorarioPayload[] = [];
      const seen = new Set<string>();
      for (const item of scheduleToPersist) {
        const key = `${item.id_usuario}|${item.id_aula}|${item.dia_semana}|${item.hora_inicio}|${item.hora_fin}`;
        if (!seen.has(key)) {
          seen.add(key);
          if (hasDuplicateHorario(item, form.id_horario ?? null)) {
            const profesorNombre = getProfessorLabel(usuarios.find((usuario) => Number(usuario.id_usuario) === Number(item.id_usuario)));
            setMessage(`No se puede guardar porque el horario de ${profesorNombre} ya existe.`);
            return;
          }
          deduplicated.push(item);
        }
      }

      if (!supabase) {
        const current = getLocalStorageJson<HorarioRecord[]>("cache-horarios") ?? [];
        const mapped = deduplicated.map((item) => {
          const display = resolveHorarioDisplay(item.id_usuario, item.id_aula, usuarios, aulas);

          return {
            id_horario: Date.now() + Math.random(),
            id_usuario: item.id_usuario,
            id_aula: item.id_aula,
            dia_semana: item.dia_semana,
            hora_inicio: item.hora_inicio,
            hora_fin: item.hora_fin,
            usuarios: { nombre: display.usuario.nombre, apellido: display.usuario.apellido },
            aulas: { nombre_aula: display.aula.nombre_aula, codigo_aula: display.aula.codigo_aula },
          } satisfies HorarioRecord;
        });

        const updated = [...mapped, ...current];
        saveHorariosToLocal(updated);
        setHorarios(updated);
      } else {
        for (const item of deduplicated) {
          await saveSingleHorario(item);
        }
        await loadData();
      }

      hydrateFormFromExtracted(deduplicated);
      setSelectedProfessorId("");
      setMessage(`Se cargaron automáticamente ${deduplicated.length} horarios desde el PDF.`);
      setParsedHorarios([]);
      setPdfText("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el lote de horarios.");
      console.error(error);
    } finally {
      setSaving(false);
    }
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
          <div className="form-card">
            <h3>Cargar horario desde PDF</h3>

            <div className="form-grid">
              <label className="full-width">
                Archivo PDF
                <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
              </label>
            </div>

            {pdfBusy ? <p className="form-feedback">Procesando archivo PDF...</p> : null}

            {parsedHorarios.length ? (
              <div className="form-actions" style={{ marginTop: "1rem" }}>
                <button type="button" className="primary-button" onClick={() => persistParsedHorarios()} disabled={saving}>
                  {saving ? "Guardando..." : `Guardar ${parsedHorarios.length} horarios detectados`}
                </button>
              </div>
            ) : null}

            {pdfText ? (
              <div className="table-card" style={{ marginTop: "1rem" }}>
                <div className="table-header">
                  <h3>Texto extraído</h3>
                </div>
                <div style={{ whiteSpace: "pre-wrap", maxHeight: "220px", overflow: "auto", padding: "0.75rem" }}>
                  {pdfText.slice(0, 1200)}
                </div>
              </div>
            ) : null}
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <h3>{form.id_horario ? "Editar horario" : "Registrar horario"}</h3>

            <div className="form-grid">
              <label>
                Docente
                <select value={form.id_usuario} onChange={(event) => handleChange("id_usuario", event.target.value)}>
                  <option value="">Selecciona docente</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>{getProfessorLabel(usuario)}</option>
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
              <h3>Horarios por profesor</h3>
              <select value={selectedProfessorId} onChange={(event) => setSelectedProfessorId(event.target.value)}>
                <option value="">Todos los docentes</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id_usuario} value={usuario.id_usuario}>{getProfessorLabel(usuario)}</option>
                ))}
              </select>
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
                  {(selectedProfessorId ? teacherSchedule : filtered).map((horario) => (
                    <tr key={horario.id_horario}>
                      <td>{getProfessorLabel(usuarios.find((usuario) => Number(usuario.id_usuario) === Number(horario.id_usuario)) ?? horario.usuarios)}</td>
                      <td>{horario.aulas?.nombre_aula ?? "Sin aula"}</td>
                      <td>{horario.dia_semana}</td>
                      <td>{horario.hora_inicio} - {horario.hora_fin}</td>
                      <td>
                        <div className="inline-actions">
                          <button type="button" className="ghost-button" onClick={() => handleEdit(horario)}>Editar</button>
                          <button type="button" className="ghost-button danger" onClick={() => handleDelete(horario.id_horario)}>Eliminar</button>
                        </div>
                      </td>
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
