// ===========================================
// Environment Variable Validation
// ===========================================
// Validasi runtime untuk server-side env vars.
// Dipanggil di API routes untuk memastikan semua key tersedia.

import { z } from "zod";

/**
 * Schema untuk client-side environment variables.
 * Variabel ini aman untuk diekspos ke browser.
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

/**
 * Schema untuk server-side environment variables.
 * ⚠️ JANGAN ekspos ke client.
 */
export const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  PAYMENT_SECRET_KEY: z.string().min(1),
  PAYMENT_WEBHOOK_SECRET: z.string().min(1),
});

/**
 * Validasi server env vars.
 * Hanya boleh dipanggil di server-side.
 * @throws Error jika dipanggil di client atau env vars missing
 */
export function validateServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("validateServerEnv() must only be called on the server!");
  }
  return serverEnvSchema.parse(process.env);
}
