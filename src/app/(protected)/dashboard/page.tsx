// ===========================================
// Dashboard Page — DataInsight Mini
// ===========================================
// Menampilkan riwayat analisis pengguna.

import { connection } from "next/server";
import { getAnalyses } from "@/features/database/analysis-service";
import { DashboardClient } from "./client";

export const metadata = {
  title: "Dashboard — DataInsight Mini",
  description: "Riwayat analisis data bisnis Anda.",
};

export default async function DashboardPage() {
  await connection();
  const { data: analyses, error } = await getAnalyses();

  return <DashboardClient analyses={analyses} error={error} />;
}
