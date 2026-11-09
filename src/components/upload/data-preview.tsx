// ===========================================
// DataInsight Mini — Data Preview Component
// ===========================================
// Shows parsed data profile: columns, quality, preview table.

"use client";

import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Columns3,
  Rows3,
  FileText,
  Hash,
  Calendar,
  Type,
  ToggleLeft,
  HelpCircle,
} from "lucide-react";
import type { DataProfile, DetectedColumnType } from "@/features/data-import/import-types";
import { cn } from "@/lib/utils";

interface DataPreviewProps {
  profile: DataProfile;
}

const typeIcons: Record<DetectedColumnType, React.ElementType> = {
  numeric: Hash,
  date: Calendar,
  categorical: Columns3,
  text: Type,
  boolean: ToggleLeft,
  empty: HelpCircle,
  unknown: HelpCircle,
};

const typeLabels: Record<DetectedColumnType, string> = {
  numeric: "Numerik",
  date: "Tanggal",
  categorical: "Kategori",
  text: "Teks",
  boolean: "Boolean",
  empty: "Kosong",
  unknown: "Tidak diketahui",
};

export function DataPreview({ profile }: DataPreviewProps) {
  const errorIssues = profile.qualityIssues.filter((i) => i.severity === "error");
  const warnIssues = profile.qualityIssues.filter((i) => i.severity === "warning");

  return (
    <div className="space-y-5">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={FileText} label="File" value={profile.fileName} />
        <StatCard icon={Rows3} label="Baris" value={profile.rowCount.toLocaleString("id-ID")} />
        <StatCard icon={Columns3} label="Kolom" value={String(profile.columnCount)} />
        <StatCard
          icon={CheckCircle2}
          label="Duplikat"
          value={profile.duplicateRowCount > 0 ? `${profile.duplicateRowCount} baris` : "Tidak ada"}
          variant={profile.duplicateRowCount > 0 ? "warning" : "success"}
        />
      </div>

      {/* Quality Issues */}
      {(errorIssues.length > 0 || warnIssues.length > 0) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-navy-900">Kualitas Data</h3>
          {errorIssues.map((issue, i) => (
            <div key={`err-${i}`} className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <span className="text-danger">{issue.message}</span>
            </div>
          ))}
          {warnIssues.map((issue, i) => (
            <div key={`warn-${i}`} className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <span className="text-navy-700">{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Column Profiles */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-navy-900">Profil Kolom</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Kolom</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Tipe</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Terisi</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Unik</th>
                <th className="hidden px-3 py-2 text-left font-medium text-muted-foreground sm:table-cell">Contoh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profile.columns.map((col) => {
                const Icon = typeIcons[col.detectedType];
                const fillPct = col.totalCount > 0 ? (col.nonNullCount / col.totalCount) * 100 : 0;
                return (
                  <tr key={col.name} className="hover:bg-muted/50">
                    <td className="px-3 py-2 font-medium text-navy-900">{col.name}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Icon className="h-3 w-3" />
                        {typeLabels[col.detectedType]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={cn(fillPct < 80 ? "text-warning" : "text-navy-700")}>
                        {fillPct.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-navy-700">{col.uniqueCount}</td>
                    <td className="hidden max-w-[200px] truncate px-3 py-2 text-muted-foreground sm:table-cell">
                      {col.sampleValues.slice(0, 3).map(String).join(", ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Preview Table */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-navy-900">
          Preview Data ({Math.min(profile.previewRows.length, 20)} baris pertama)
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-2 py-2 text-center font-medium text-muted-foreground">#</th>
                {profile.columns.map((col) => (
                  <th key={col.name} className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profile.previewRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/50">
                  <td className="px-2 py-1.5 text-center text-muted-foreground">{idx + 1}</td>
                  {profile.columns.map((col) => {
                    const val = row[col.name];
                    const isEmpty = val == null || (typeof val === "string" && val.trim() === "");
                    return (
                      <td key={col.name} className={cn("whitespace-nowrap px-3 py-1.5", isEmpty ? "text-muted-foreground/50 italic" : "text-navy-800")}>
                        {isEmpty ? "—" : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: "default" | "success" | "warning";
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-white p-3">
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          variant === "success" ? "text-success" : variant === "warning" ? "text-warning" : "text-accent-600"
        )}
      />
      <div className="min-w-0">
        <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-navy-900">{value}</p>
      </div>
    </div>
  );
}
