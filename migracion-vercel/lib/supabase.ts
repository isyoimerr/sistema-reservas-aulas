import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const isValidSupabaseUrl = (value: string | undefined) =>
  typeof value === "string" && /^https:\/\/.+\.supabase\.co(\/)?$/i.test(value.trim());

const resolvedSupabaseUrl = typeof supabaseUrl === "string" ? supabaseUrl.trim() : "";
const resolvedSupabaseAnonKey = typeof supabaseAnonKey === "string" ? supabaseAnonKey.trim() : "";

export const supabase =
  !demoMode && isValidSupabaseUrl(resolvedSupabaseUrl) && resolvedSupabaseAnonKey.length > 0
    ? createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);
export const isDemoModeEnabled = demoMode;

export async function checkSupabaseConnection() {
  if (demoMode) {
    return {
      ok: false,
      error: "La aplicación está en modo demo. Supabase está desactivado temporalmente.",
    };
  }

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase no está configurado. Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  try {
    const { error } = await supabase.from("roles").select("id_rol", { count: "exact", head: true });
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
