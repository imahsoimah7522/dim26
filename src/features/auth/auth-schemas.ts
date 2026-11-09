// ===========================================
// Auth Zod Schemas — DataInsight Mini
// ===========================================

import { z } from "zod/v4";

/** Login form validation */
export const LoginSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

/** Signup form validation */
export const SignupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama terlalu panjang."),
  email: z.email("Email tidak valid."),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/[0-9]/, "Password harus mengandung angka."),
});

/** Profile update validation */
export const ProfileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama terlalu panjang.")
    .optional(),
  businessName: z
    .string()
    .max(200, "Nama bisnis terlalu panjang.")
    .optional(),
  businessType: z
    .string()
    .max(100, "Tipe bisnis terlalu panjang.")
    .optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
