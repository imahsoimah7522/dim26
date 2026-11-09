// ===========================================
// Dashboard Client Component — DataInsight Mini
// ===========================================
// Menampilkan riwayat analisis dan aksi terkait.

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Brain,
  Calendar,
  Rows3,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteAnalysis } from "@/features/database/analysis-service";
import type { AnalysisRow } from "@/features/database";

interface DashboardClientProps {
  analyses: AnalysisRow[];
  error: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DashboardClient({ analyses, error }: DashboardClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Hapus analisis ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteAnalysis(id);
      if (result.error) {
        alert(result.error);
      }
      setDeletingId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Riwayat analisis data bisnis Anda
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Plus className="mr-2 h-4 w-4" />
            Analisis Baru
          </Link>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {analyses.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white p-12 text-center">
          <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold text-navy-900">
            Belum ada analisis
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Upload file Excel atau CSV untuk mulai menganalisis data bisnis
            Anda.
          </p>
          <Button asChild className="mt-6">
            <Link href="/upload">
              <Plus className="mr-2 h-4 w-4" />
              Mulai Analisis
            </Link>
          </Button>
        </div>
      )}

      {/* Analysis list */}
      {analyses.length > 0 && (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50">
                  <FileSpreadsheet className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy-900">
                    {analysis.file_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(analysis.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Rows3 className="h-3 w-3" />
                      {analysis.row_count.toLocaleString("id-ID")} baris
                    </span>
                    <span>{formatFileSize(analysis.file_size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {analysis.has_ai_insights && (
                  <Badge variant="secondary" className="gap-1">
                    <Brain className="h-3 w-3" />
                    AI
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(analysis.id)}
                  disabled={isPending && deletingId === analysis.id}
                  className="text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
