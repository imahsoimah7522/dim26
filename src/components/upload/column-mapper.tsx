// ===========================================
// DataInsight Mini — Column Mapper Component
// ===========================================
// Allows users to map spreadsheet columns to analytics roles.

"use client";

import { useEffect, useCallback } from "react";
import { ArrowRight, Columns3, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnMapping, MappingRole } from "@/features/analytics/analytics-types";
import type { ColumnProfile, DetectedColumnType } from "@/features/data-import/import-types";

// ─── Types ──────────────────────────────────────────

interface ColumnMapperProps {
  columns: ColumnProfile[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

/** Configuration for each mapping role */
interface RoleConfig {
  role: MappingRole;
  label: string;
  description: string;
  /** Column types that are good matches for this role */
  suggestedTypes: DetectedColumnType[];
}

// ─── Role Definitions ───────────────────────────────

const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: "date",
    label: "Tanggal",
    description: "Kolom tanggal transaksi",
    suggestedTypes: ["date"],
  },
  {
    role: "product",
    label: "Produk",
    description: "Nama produk atau item",
    suggestedTypes: ["categorical", "text"],
  },
  {
    role: "revenue",
    label: "Pendapatan",
    description: "Nilai penjualan / omzet",
    suggestedTypes: ["numeric"],
  },
  {
    role: "quantity",
    label: "Kuantitas",
    description: "Jumlah unit terjual",
    suggestedTypes: ["numeric"],
  },
  {
    role: "category",
    label: "Kategori",
    description: "Kategori produk",
    suggestedTypes: ["categorical"],
  },
  {
    role: "branch",
    label: "Cabang",
    description: "Cabang atau lokasi",
    suggestedTypes: ["categorical", "text"],
  },
];

// ─── Auto-detection ─────────────────────────────────

/** Keywords for each role used in auto-detection (lowercased) */
const ROLE_KEYWORDS: Record<MappingRole, string[]> = {
  date: ["tanggal", "date", "tgl", "waktu", "time", "datetime", "periode"],
  product: ["produk", "product", "item", "barang", "nama_produk", "nama produk", "menu"],
  revenue: [
    "pendapatan", "revenue", "total", "harga", "price", "amount",
    "nilai", "omzet", "penjualan", "sales", "subtotal", "sub_total",
  ],
  quantity: ["kuantitas", "quantity", "qty", "jumlah", "unit", "banyak", "stok"],
  category: ["kategori", "category", "jenis", "tipe", "type", "grup", "group", "kelompok"],
  branch: ["cabang", "branch", "lokasi", "location", "toko", "store", "outlet", "kota", "city"],
};

/**
 * Auto-detect column-to-role mapping based on column names and types.
 * Returns a partial mapping — only roles where a confident match is found.
 */
export function autoDetectMapping(columns: ColumnProfile[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const usedColumns = new Set<string>();

  // For each role, try to find the best matching column
  for (const config of ROLE_CONFIGS) {
    let bestMatch: string | undefined;
    let bestScore = 0;

    for (const col of columns) {
      // Skip already-used columns
      if (usedColumns.has(col.name)) continue;

      const nameLower = col.name.toLowerCase().trim();
      let score = 0;

      // Check keyword match in column name
      const keywords = ROLE_KEYWORDS[config.role];
      for (const keyword of keywords) {
        if (nameLower === keyword) {
          // Exact match = highest score
          score = 10;
          break;
        } else if (nameLower.includes(keyword)) {
          score = Math.max(score, 5);
        }
      }

      // Bonus if column type matches suggested types
      if (score > 0 && config.suggestedTypes.includes(col.detectedType)) {
        score += 3;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = col.name;
      }
    }

    if (bestMatch) {
      mapping[config.role] = bestMatch;
      usedColumns.add(bestMatch);
    }
  }

  return mapping;
}

// ─── Component ──────────────────────────────────────

export function ColumnMapper({
  columns,
  mapping,
  onMappingChange,
  onAnalyze,
  isAnalyzing = false,
}: ColumnMapperProps) {
  // Auto-detect on mount if mapping is empty and columns are provided
  useEffect(() => {
    const hasMapping = Object.values(mapping).some((v) => v !== undefined && v !== "");
    if (!hasMapping && columns.length > 0) {
      const detected = autoDetectMapping(columns);
      if (Object.keys(detected).length > 0) {
        onMappingChange(detected);
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = useCallback(
    (role: MappingRole, columnName: string) => {
      const updated: ColumnMapping = { ...mapping };
      if (columnName === "") {
        delete updated[role];
      } else {
        updated[role] = columnName;
      }
      onMappingChange(updated);
    },
    [mapping, onMappingChange],
  );

  const mappedCount = Object.values(mapping).filter(
    (v) => v !== undefined && v !== "",
  ).length;

  const canAnalyze = mappedCount > 0 && !isAnalyzing;

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Columns3 className="h-5 w-5 text-accent-600" />
        <h2 className="text-base font-semibold text-navy-900">
          Pemetaan Kolom
        </h2>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Petakan kolom dari data Anda ke peran analisis. Semua pemetaan bersifat
        opsional — pilih kolom yang sesuai dengan data Anda.
      </p>

      {/* Mapping Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLE_CONFIGS.map((config) => (
          <RoleSelector
            key={config.role}
            config={config}
            columns={columns}
            selectedColumn={mapping[config.role] ?? ""}
            onChange={(value) => handleRoleChange(config.role, value)}
            disabled={isAnalyzing}
          />
        ))}
      </div>

      {/* Status & Action */}
      <div className="mt-5 flex flex-col items-start justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {mappedCount === 0 ? (
            "Belum ada kolom yang dipetakan"
          ) : (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              {mappedCount} dari {ROLE_CONFIGS.length} peran dipetakan
            </span>
          )}
        </p>
        <button
          type="button"
          disabled={!canAnalyze}
          onClick={onAnalyze}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
            canAnalyze
              ? "bg-accent-600 text-white hover:bg-accent-700"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menganalisis...
            </>
          ) : (
            <>
              Mulai Analisis
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Role Selector ──────────────────────────────────

function RoleSelector({
  config,
  columns,
  selectedColumn,
  onChange,
  disabled,
}: {
  config: RoleConfig;
  columns: ColumnProfile[];
  selectedColumn: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  // Sort columns: suggested types first, then alphabetical
  const sortedColumns = [...columns].sort((a, b) => {
    const aIsSuggested = config.suggestedTypes.includes(a.detectedType);
    const bIsSuggested = config.suggestedTypes.includes(b.detectedType);
    if (aIsSuggested && !bIsSuggested) return -1;
    if (!aIsSuggested && bIsSuggested) return 1;
    return a.name.localeCompare(b.name);
  });

  // Type labels for display in dropdown
  const typeLabel = (type: DetectedColumnType): string => {
    const labels: Record<DetectedColumnType, string> = {
      numeric: "Numerik",
      date: "Tanggal",
      categorical: "Kategori",
      text: "Teks",
      boolean: "Boolean",
      empty: "Kosong",
      unknown: "?",
    };
    return labels[type];
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <label
        htmlFor={`role-${config.role}`}
        className="mb-1 block text-sm font-medium text-navy-900"
      >
        {config.label}
      </label>
      <p className="mb-2 text-xs text-muted-foreground">{config.description}</p>
      <select
        id={`role-${config.role}`}
        value={selectedColumn}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-navy-900 transition-colors",
          "focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selectedColumn ? "border-accent-300" : "",
        )}
      >
        <option value="">— Tidak dipetakan —</option>
        {sortedColumns.map((col) => {
          const isSuggested = config.suggestedTypes.includes(col.detectedType);
          return (
            <option key={col.name} value={col.name}>
              {col.name} [{typeLabel(col.detectedType)}]
              {isSuggested ? " ✓" : ""}
            </option>
          );
        })}
      </select>
    </div>
  );
}
