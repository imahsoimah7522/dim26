// ===========================================
// Proxy — Session Refresh & Route Protection
// ===========================================
// Next.js 16: middleware.js deprecated → proxy.ts
// Export function 'proxy' (bukan 'middleware').
//
// Fungsi:
// 1. Refresh Supabase auth session di setiap request.
// 2. Redirect unauthenticated users dari protected routes ke /login.
// 3. Redirect authenticated users dari auth routes ke /dashboard.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/profile"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Jika env vars belum dikonfigurasi, lewati auth check
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Jangan tambahkan kode antara createServerClient
  // dan supabase.auth.getUser(). Bisa menyebabkan random logout.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes: redirect ke login jika tidak authenticated
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Auth routes: redirect ke dashboard jika sudah authenticated
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
