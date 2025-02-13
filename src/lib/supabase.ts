import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = "https://womaqnguctkhxqdiacwp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvbWFxbmd1Y3RraHhxZGlhY3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwNDMxNjAsImV4cCI6MjA1NDYxOTE2MH0.CQid2n4-PmkLnujzAT-FEmVPFO_h4dv-duKjmwpOhn0";

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
    detectSessionInUrl: false,
    storage: localStorage,
    storageKey: "geoapp-auth",
    debug: true,
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
