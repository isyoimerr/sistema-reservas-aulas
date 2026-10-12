import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = Boolean(supabase);

export async function checkSupabaseConnection() {
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
