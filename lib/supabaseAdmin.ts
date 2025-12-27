// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "ENV manquante: SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL)."
  );
}

if (!serviceRoleKey) {
  throw new Error("ENV manquante: SUPABASE_SERVICE_ROLE_KEY.");
}

// ⚠️ À utiliser uniquement côté serveur (API routes, webhooks)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "X-Client-Info": "copyshop-ia/server",
    },
  },
});
