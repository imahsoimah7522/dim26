// ===========================================
// Login Form Component — DataInsight Mini
// ===========================================

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/features/auth/auth-actions";
import type { LoginFormState } from "@/features/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<
    LoginFormState | undefined,
    FormData
  >(login, undefined);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Masuk</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masuk ke akun DataInsight Mini Anda
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
            autoComplete="email"
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Masukkan password"
            required
            minLength={6}
            autoComplete="current-password"
            disabled={pending}
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent-600 hover:text-accent-700 hover:underline"
        >
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
