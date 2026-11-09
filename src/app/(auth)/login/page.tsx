// ===========================================
// Login Page — DataInsight Mini
// ===========================================

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Masuk — DataInsight Mini",
  description: "Masuk ke akun DataInsight Mini Anda.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <BarChart3 className="h-7 w-7 text-accent-600" />
        <span className="text-xl font-bold text-navy-900">
          DataInsight Mini
        </span>
      </Link>

      <div className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
