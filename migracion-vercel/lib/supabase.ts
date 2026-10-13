import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const demoModeEnvValue = process.env.NEXT_PUBLIC_DEMO_MODE?.toLowerCase() ?? "";

const isPlaceholderValue = (value: string | undefined) => {
  if (typeof value !== "string") return true;
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes("tu-proyecto") ||
    normalized.includes("tu_anon_key") ||
    normalized.includes("tu-url") ||
    normalized.includes("example") ||
    normalized.includes("placeholder")
  );
};

const isDashboardUrl = (value: string | undefined) => {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return /https:\/\/supabase\.com\/dashboard\/project\//i.test(normalized);
};

const normalizeSupabaseUrl = (value: string | undefined) => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  const dashboardMatch = trimmed.match(/^https:\/\/supabase\.com\/dashboard\/project\/([a-z0-9-]+)(?:\/.*)?$/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  const bareProjectRef = trimmed.match(/^([a-z0-9-]{8,64})$/i);
  if (bareProjectRef) {
    return `https://${bareProjectRef[1]}.supabase.co`;
  }

  return trimmed;
};

const resolvedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl);
const resolvedSupabaseAnonKey = typeof supabaseAnonKey === "string" ? supabaseAnonKey.trim() : "";

const hasPlaceholderCredentials = isPlaceholderValue(resolvedSupabaseUrl) || isPlaceholderValue(resolvedSupabaseAnonKey);
const demoMode = demoModeEnvValue === "true" || (!supabaseUrl && !supabaseAnonKey) || hasPlaceholderCredentials;

const isValidSupabaseUrl = (value: string | undefined) => {
  if (typeof value !== "string") return false;

  const normalized = normalizeSupabaseUrl(value);
  return /^https:\/\/[a-z0-9-]+\.supabase\.co(\/)?$/i.test(normalized.trim());
};

export const supabase =
  !demoMode && isValidSupabaseUrl(supabaseUrl) && resolvedSupabaseAnonKey.length > 0
    ? createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

export type SupabaseConnectionStatus = {
  enabled: boolean;
  demo: boolean;
  reason: string | null;
  message: string;
};

export function getSupabaseStatus(): SupabaseConnectionStatus {
  const hasMissingEnv = !resolvedSupabaseUrl || !resolvedSupabaseAnonKey;
  const hasDashboardUrl = isDashboardUrl(resolvedSupabaseUrl);
  const hasInvalidUrl = Boolean(resolvedSupabaseUrl) && !isValidSupabaseUrl(resolvedSupabaseUrl);

  if (demoMode) {
    return {
      enabled: false,
      demo: true,
      reason: "demo-mode",
      message:
        "Modo demo activo: Supabase no está configurado. Los datos se guardan solo localmente; configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para persistencia real.",
    };
  }

  if (hasDashboardUrl) {
    return {
      enabled: false,
      demo: false,
      reason: "dashboard-url",
      message:
        "Estás usando la URL del dashboard de Supabase, no la URL del proyecto. Debe ser algo como https://<ref>.supabase.co, no https://supabase.com/dashboard/project/<ref>.",
    };
  }

  if (hasMissingEnv) {
    return {
      enabled: false,
      demo: false,
      reason: "missing-env",
      message:
        "Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. El sistema no puede guardar en la base real.",
    };
  }

  if (hasInvalidUrl) {
    return {
      enabled: false,
      demo: false,
      reason: "invalid-url",
      message:
        "La URL de Supabase no es válida. Revisa NEXT_PUBLIC_SUPABASE_URL antes de intentar guardar reservas o usuarios reales.",
    };
  }

  if (!supabase) {
    return {
      enabled: false,
      demo: false,
      reason: "client-unavailable",
      message:
        "Supabase no pudo inicializarse. Revisa la configuración del proyecto y las credenciales de anon key.",
    };
  }

  return {
    enabled: true,
    demo: false,
    reason: null,
    message: "Supabase conectado y listo para guardar datos reales.",
  };
}

export const supabaseStatus = getSupabaseStatus();
export const isSupabaseConfigured = supabaseStatus.enabled;
export const isDemoModeEnabled = supabaseStatus.demo;

export async function checkSupabaseConnection() {
  const status = getSupabaseStatus();

  if (!status.enabled) {
    return {
      ok: false,
      error: status.message,
    };
  }

  try {
    const { error } = await supabase!.from("roles").select("id_rol", { count: "exact", head: true });
    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return { ok: true, error: null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No fue posible conectar con Supabase.",
    };
  }
}
