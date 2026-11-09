// ===========================================
// Supabase Admin Client — Service Role (Server-Only)
// ===========================================
// ⚠️ HANYA untuk server-side: API routes, webhooks.
// ⚠️ JANGAN import di client components atau Server Components biasa.
// ⚠️ Service role BYPASS RLS — gunakan dengan hati-hati.

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Check .env.local file. " +
        "This client should only be used server-side."
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
