// ===========================================
// Signup Form Component — DataInsight Mini
// ===========================================

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/features/auth/auth-actions";
import type { SignupFormState } from "@/features/auth";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<
    SignupFormState | undefined,
    FormData
  >(signup, undefined);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Daftar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Buat akun DataInsight Mini gratis
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Nama lengkap Anda"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            disabled={pending}
          />
          {state?.fieldErrors?.fullName && (
            <p className="text-xs text-danger">
              {state.fieldErrors.fullName[0]}
            </p>
          )}
        </div>

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
          {state?.fieldErrors?.email && (
            <p className="text-xs text-danger">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimal 8 karakter"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
          />
          {state?.fieldErrors?.password && (
            <ul className="mt-1 space-y-0.5 text-xs text-danger">
              {state.fieldErrors.password.map((err) => (
                <li key={err}>• {err}</li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-accent-600 hover:text-accent-700 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
