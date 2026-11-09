// ===========================================
// Protected Layout — DataInsight Mini
// ===========================================
// Layout untuk halaman yang memerlukan autentikasi.
// Double-check auth (selain proxy.ts) untuk keamanan berlapis.
// Menggunakan Suspense agar kompatibel dengan Next.js 16 Cache Components.

import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";

/** Header dinamis — memerlukan cookies untuk auth check. */
async function ProtectedHeader() {
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
  );
}

/** Fallback header saat loading. */
function HeaderFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent-600" />
          <span className="text-sm font-bold text-navy-900">
            DataInsight Mini
          </span>
        </Link>
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      </div>
    </header>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<HeaderFallback />}>
        <ProtectedHeader />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
