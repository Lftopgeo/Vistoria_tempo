import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key not found. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
  );
  throw new Error(
    "Configuração do Supabase não encontrada. Por favor, verifique as variáveis de ambiente.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: "geoapp-auth",
    debug: import.meta.env.DEV,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-application-name": "geoapp",
    },
  },
});
