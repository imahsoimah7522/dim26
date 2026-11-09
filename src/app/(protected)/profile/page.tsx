// ===========================================
// Profile Page — DataInsight Mini
// ===========================================
// Manajemen profil pengguna.

import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./client";

export const metadata = {
  title: "Profil — DataInsight Mini",
  description: "Kelola profil akun Anda.",
};

export default async function ProfilePage() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <ProfileClient
      email={user.email ?? ""}
      profile={
        profile
          ? {
              fullName: profile.full_name ?? "",
              businessName: profile.business_name ?? "",
              businessType: profile.business_type ?? "",
            }
          : { fullName: "", businessName: "", businessType: "" }
      }
    />
  );
}
