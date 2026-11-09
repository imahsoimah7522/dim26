// ===========================================
// Profile Client Component — DataInsight Mini
// ===========================================
// Form untuk mengedit profil pengguna.

"use client";

import { useActionState } from "react";
import { User, Building2, Briefcase, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/features/auth/auth-actions";
import type { ProfileFormState } from "@/features/auth";

interface ProfileClientProps {
  email: string;
  profile: {
    fullName: string;
    businessName: string;
    businessType: string;
  };
}

export function ProfileClient({ email, profile }: ProfileClientProps) {
  const [state, formAction, pending] = useActionState<
    ProfileFormState | undefined,
    FormData
  >(updateProfile, undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola informasi akun Anda
        </p>
      </div>

      <div className="max-w-lg rounded-xl border border-border bg-white p-6">
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <Check className="h-4 w-4" />
              Profil berhasil diperbarui.
            </div>
          )}

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {email}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Nama Lengkap
              </span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={profile.fullName}
              placeholder="Nama lengkap Anda"
              disabled={pending}
            />
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Nama Bisnis
              </span>
            </Label>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              defaultValue={profile.businessName}
              placeholder="Nama bisnis / toko Anda"
              disabled={pending}
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="businessType">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Tipe Bisnis
              </span>
            </Label>
            <Input
              id="businessType"
              name="businessType"
              type="text"
              defaultValue={profile.businessType}
              placeholder="Contoh: F&B, Retail, Jasa"
              disabled={pending}
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Simpan Profil
          </Button>
        </form>
      </div>
    </div>
  );
}
