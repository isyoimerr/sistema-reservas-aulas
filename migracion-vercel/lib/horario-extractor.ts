export type ProfesorRef = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email?: string;
};

export type AulaRef = {
  id_aula: number;
  codigo_aula: string;
  nombre_aula: string;
};

export type HorarioPayload = {
  id_usuario: number;
  id_aula: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  fuente: "pdf" | "manual";
};

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const dayMap: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  miércoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  sábado: "Sábado",
};

export function extractDocenteNameFromText(text: string): string {
  const patterns = [
    /docente\s*[:\-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+){1,6})(?=\s*(?:Código docente|Código|Documento|Facultad|Departamento|Correo|Dedicación|Periodo|Detalle|VISTA|Total))/i,
    /profesor\s*[:\-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+){1,6})(?=\s*(?:Código|Documento|Facultad|Departamento|Correo|Dedicación|Periodo|Detalle|VISTA|Total))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, " ").trim();
    }
  }

  return "";
}

export function extractPdfMetadata(text: string) {
  const emailMatch = text.match(/correo\s*[:\-]?\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  const codigoDocenteMatch = text.match(/codigo\s*docente\s*[:\-]?\s*([A-Z0-9-]+)/i);
  const documentoMatch = text.match(/documento\s*[:\-]?\s*([0-9.]+)/i);
  const facultadMatch = text.match(/facultad\s*[:\-]?\s*([^\n]+)/i);
  const departamentoMatch = text.match(/departamento\s*[:\-]?\s*([^\n]+)/i);

  return {
    email: emailMatch?.[1]?.trim() ?? "",
    codigoDocente: codigoDocenteMatch?.[1]?.trim() ?? "",
    documento: documentoMatch?.[1]?.trim() ?? "",
    facultad: facultadMatch?.[1]?.replace(/\s+/g, " ").trim() ?? "",
    departamento: departamentoMatch?.[1]?.replace(/\s+/g, " ").trim() ?? "",
  };
}

export function extractPrimaryProfesorFromText(text: string, profesores: ProfesorRef[]): ProfesorRef | undefined {
  const docenteNombre = extractDocenteNameFromText(text);
  if (!docenteNombre) return profesores[0];

  return (
    profesores.find((profesor) => {
      const nombreCompleto = `${profesor.nombre ?? ""} ${profesor.apellido ?? ""}`.trim();
      const comparador = normalizeText(nombreCompleto);
      const entrada = normalizeText(docenteNombre);
      return comparador.includes(entrada) || entrada.includes(comparador);
    }) ?? profesores[0]
  );
}

export async function extractTextFromPdf(file: File): Promise<string> {
  if (!file || file.type !== "application/pdf") {
    throw new Error("Se requiere un archivo PDF válido.");
  }

  const pdfjsLib = await import("pdfjs-dist");

  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const pdfDocument = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];

  for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex += 1) {
    const page = await pdfDocument.getPage(pageIndex);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n").replace(/\s+/g, " ").trim();
}

export function adaptExtractedHorario(text: string, profesores: ProfesorRef[], aulas: AulaRef[]): HorarioPayload[] {
  if (!text.trim()) return [];

  const sanitizedText = text.replace(/\s+/g, " ").trim();
  const results: HorarioPayload[] = [];
  const seen = new Set<string>();
  const profesorPrincipal = extractPrimaryProfesorFromText(sanitizedText, profesores) ?? profesores[0];

  const dayPattern = /(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo)/gi;
  const dayMatches = [...sanitizedText.matchAll(dayPattern)];

  if (!dayMatches.length) {
    const fallbackMatch = sanitizedText.match(/(\d{1,2}:\d{2})\s*(?:a|al|-|–|hasta)\s*(\d{1,2}:\d{2})/i);
    if (fallbackMatch && profesores[0] && aulas[0]) {
      const [, startRaw, endRaw] = fallbackMatch;
      results.push({
        id_usuario: profesores[0].id_usuario,
        id_aula: aulas[0].id_aula,
        dia_semana: "Lunes",
        hora_inicio: startRaw.padStart(5, "0"),
        hora_fin: endRaw.padStart(5, "0"),
        fuente: "pdf",
      });
    }
    return results;
  }

  const findAulaForSegment = (segment: string): AulaRef | undefined => {
    const normalizedSegment = normalizeText(segment);
    const ranked = [...aulas].sort((a, b) => {
      const aText = normalizeText(`${a.codigo_aula} ${a.nombre_aula}`);
      const bText = normalizeText(`${b.codigo_aula} ${b.nombre_aula}`);
      const aScore = aText.split(/\s+/).filter((token) => normalizedSegment.includes(token)).length;
      const bScore = bText.split(/\s+/).filter((token) => normalizedSegment.includes(token)).length;
      return bScore - aScore;
    });

    return ranked.find((aula) => {
      const haystack = normalizeText(`${aula.codigo_aula} ${aula.nombre_aula}`);
      return normalizedSegment.includes(haystack) || haystack.includes(normalizedSegment) || normalizedSegment.includes(normalizeText(aula.codigo_aula)) || normalizedSegment.includes(normalizeText(aula.nombre_aula));
    }) ?? aulas[0];
  };

  for (let index = 0; index < dayMatches.length; index += 1) {
    const currentDay = dayMatches[index];
    const currentDayName = currentDay[1];
    const dayStart = currentDay.index ?? 0;
    const nextDayStart = dayMatches[index + 1]?.index ?? sanitizedText.length;
    const daySegment = sanitizedText.slice(dayStart, nextDayStart).trim();

    const rowMatches = [...daySegment.matchAll(/(\d{1,2}:\d{2})\s*(?:a|al|-|–|hasta)\s*(\d{1,2}:\d{2})/gi)];

    for (const rowMatch of rowMatches) {
      const timeStart = rowMatch[1].padStart(5, "0");
      const timeEnd = rowMatch[2].padStart(5, "0");
      const rowStart = (rowMatch.index ?? 0) + daySegment.indexOf(rowMatch[0]);
      const rowEnd = rowMatches[rowMatches.indexOf(rowMatch) + 1]?.index ?? daySegment.length;
      const rowText = daySegment.slice(rowStart, rowEnd).trim();
      const aulaMatch = findAulaForSegment(rowText) ?? aulas[0];
      if (!aulaMatch) continue;

      const diaSemana = dayMap[normalizeText(currentDayName)] ?? currentDayName;
      const key = `${profesorPrincipal?.id_usuario ?? 0}-${aulaMatch.id_aula}-${diaSemana}-${timeStart}-${timeEnd}`;
      if (seen.has(key)) continue;

      seen.add(key);
      results.push({
        id_usuario: profesorPrincipal?.id_usuario ?? profesores[0].id_usuario,
        id_aula: aulaMatch.id_aula,
        dia_semana: diaSemana,
        hora_inicio: timeStart,
        hora_fin: timeEnd,
        fuente: "pdf",
      });
    }
  }

  return results;
}
