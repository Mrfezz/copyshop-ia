// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

// ✅ côté serveur : préférer SUPABASE_URL (et fallback sur NEXT_PUBLIC au cas où)
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Supabase admin env vars manquantes: SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY."
  );
}

// ⚠️ Client à utiliser uniquement côté serveur (API routes, webhooks, CRON)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
