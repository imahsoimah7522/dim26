// ===========================================
// Supabase Client — Browser (Client-Side)
// ===========================================
// Digunakan di Client Components (browser).
// Hanya menggunakan ANON key (aman untuk client).

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Check .env.local file."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
