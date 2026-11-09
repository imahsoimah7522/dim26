// ===========================================
// DataInsight Mini — useAnalytics Hook
// ===========================================
// React hook for managing column mapping and analytics.

"use client";

import { useState, useCallback } from "react";
import type { ParsedRow } from "@/features/data-import/import-types";
import type {
  ColumnMapping,
  MappingRole,
  AnalyticsResult,
  ChartData,
} from "@/features/analytics/analytics-types";
import { runAnalytics } from "@/features/analytics/sales-analytics";
import { buildChartData } from "@/features/analytics/chart-data-builder";

export type AnalyticsStep = "mapping" | "analyzing" | "done" | "error";

export interface AnalyticsState {
  step: AnalyticsStep;
  mapping: ColumnMapping;
  result: AnalyticsResult | null;
  chartData: ChartData | null;
  error: string | null;
}

function createInitialAnalyticsState(): AnalyticsState {
  return {
    step: "mapping",
    mapping: {},
    result: null,
    chartData: null,
    error: null,
  };
}

export function useAnalytics() {
  const [state, setState] = useState<AnalyticsState>(
    createInitialAnalyticsState()
  );

  const setMapping = useCallback((mapping: ColumnMapping) => {
    setState((prev) => ({ ...prev, mapping }));
  }, []);

  const analyze = useCallback(
    (rows: ParsedRow[]) => {
      setState((prev) => ({ ...prev, step: "analyzing", error: null }));

      try {
        const result = runAnalytics(rows, state.mapping);
        const chartData = buildChartData(result);

        setState((prev) => ({
          ...prev,
          step: "done",
          result,
          chartData,
        }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat analisis.";
        setState((prev) => ({
          ...prev,
          step: "error",
          error: message,
        }));
      }
    },
    [state.mapping]
  );

  const reset = useCallback(() => {
    setState(createInitialAnalyticsState());
  }, []);

  const updateRole = useCallback(
    (role: MappingRole, columnName: string | null) => {
      setState((prev) => {
        const next = { ...prev.mapping };
        if (columnName) {
          next[role] = columnName;
        } else {
          delete next[role];
        }
        return { ...prev, mapping: next };
      });
    },
    []
  );

  return {
    state,
    setMapping,
    updateRole,
    analyze,
    reset,
  };
}
