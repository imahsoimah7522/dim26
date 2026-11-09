// ===========================================
// Auth Server Actions — DataInsight Mini
// ===========================================
// Server Actions untuk login, signup, logout, profile.
// Semua operasi auth dilakukan di server-side.

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LoginSchema, SignupSchema, ProfileUpdateSchema } from "./auth-schemas";
import type {
  LoginFormState,
  SignupFormState,
  ProfileFormState,
  UserProfile,
} from "./auth-types";

/**
 * Login dengan email dan password.
 * Dipanggil dari LoginForm via useActionState.
 */
export async function login(
  _prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const supabase = await createClient();

  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email atau password tidak valid." };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/dashboard");
}

/**
 * Daftar akun baru.
 * Dipanggil dari SignupForm via useActionState.
 */
export async function signup(
  _prevState: SignupFormState | undefined,
  formData: FormData
): Promise<SignupFormState> {
  const supabase = await createClient();

  const parsed = SignupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: {
        fullName: flattened.fieldErrors.fullName,
        email: flattened.fieldErrors.email,
        password: flattened.fieldErrors.password,
      },
    };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Email sudah terdaftar. Silakan login." };
    }
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }

  redirect("/dashboard");
}

/**
 * Logout dan redirect ke halaman utama.
 */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Update profile pengguna.
 * Dipanggil dari ProfileForm via useActionState.
 */
export async function updateProfile(
  _prevState: ProfileFormState | undefined,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const parsed = ProfileUpdateSchema.safeParse({
    fullName: formData.get("fullName") || undefined,
    businessName: formData.get("businessName") || undefined,
    businessType: formData.get("businessType") || undefined,
  });

  if (!parsed.success) {
    return { error: "Data profil tidak valid." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      business_name: parsed.data.businessName,
      business_type: parsed.data.businessType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Gagal memperbarui profil." };
  }

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Ambil profile pengguna saat ini.
 * Dipanggil dari server components.
 */
export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as UserProfile) ?? null;
}

/**
 * Ambil user saat ini dari session.
 * Dipanggil dari server components.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
