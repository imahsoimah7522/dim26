// ===========================================
// Dashboard Page — DataInsight Mini
// ===========================================
// Menampilkan riwayat analisis pengguna.

import { Suspense } from "react";
import { getAnalyses } from "@/features/database/analysis-service";
import { DashboardClient } from "./client";

export const metadata = {
  title: "Dashboard — DataInsight Mini",
  description: "Riwayat analisis data bisnis Anda.",
};

async function DashboardContent() {
  const { data: analyses, error } = await getAnalyses();
  return <DashboardClient analyses={analyses} error={error} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
