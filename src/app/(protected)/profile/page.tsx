// ===========================================
// Profile Page — DataInsight Mini
// ===========================================
// Manajemen profil pengguna.

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./client";

export const metadata = {
  title: "Profil — DataInsight Mini",
  description: "Kelola profil akun Anda.",
};

async function ProfileContent() {
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

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
