// ===========================================
// Protected Layout — DataInsight Mini
// ===========================================
// Layout untuk halaman yang memerlukan autentikasi.
// Double-check auth (selain proxy.ts) untuk keamanan berlapis.

import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ambil profile untuk display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent-600" />
            <span className="text-sm font-bold text-navy-900">
              DataInsight Mini
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-navy-900"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="text-sm font-medium text-muted-foreground hover:text-navy-900"
            >
              Analisis Baru
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-muted-foreground hover:text-navy-900"
            >
              Pesanan
            </Link>
            <UserMenu
              email={user.email ?? ""}
              fullName={profile?.full_name}
            />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
