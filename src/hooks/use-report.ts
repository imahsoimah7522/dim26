// ===========================================
// DataInsight Mini — useReport Hook
// ===========================================
// Manages PDF report generation state.

"use client";

import { useState, useCallback } from "react";
import type { ReportData, ReportState } from "@/features/report/report-types";

export function useReport() {
  const [state, setState] = useState<ReportState>({
    step: "idle",
    error: null,
  });

  const generate = useCallback(async (data: ReportData) => {
    setState({ step: "generating", error: null });

    try {
      // Dynamic import to avoid SSR
      const { downloadReport } = await import("@/features/report/report-builder");
      await downloadReport(data);
      setState({ step: "done", error: null });

      // Reset after a delay
      setTimeout(() => {
        setState({ step: "idle", error: null });
      }, 3000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal membuat laporan PDF.";
      setState({ step: "error", error: message });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ step: "idle", error: null });
  }, []);

  return { state, generate, reset };
}
