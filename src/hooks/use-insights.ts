// ===========================================
// DataInsight Mini — useInsights Hook
// ===========================================
// Manages AI insight request flow with consent.

"use client";

import { useState, useCallback } from "react";
import type { AnalyticsResult } from "@/features/analytics/analytics-types";
import type { QualityIssue } from "@/features/data-import/import-types";
import type {
  InsightState,
  InsightResponse,
  BusinessType,
} from "@/features/ai-insights/insight-types";
import { buildInsightPayload } from "@/features/ai-insights/summary-builder";

function createInitialState(): InsightState {
  return {
    step: "idle",
    response: null,
    error: null,
  };
}

export function useInsights() {
  const [state, setState] = useState<InsightState>(createInitialState());

  const requestConsent = useCallback(() => {
    setState((prev) => ({ ...prev, step: "requesting-consent" }));
  }, []);

  const cancelConsent = useCallback(() => {
    setState((prev) => ({ ...prev, step: "idle" }));
  }, []);

  const generateInsights = useCallback(
    async (
      result: AnalyticsResult,
      businessType: BusinessType,
      qualityIssues: QualityIssue[]
    ) => {
      setState((prev) => ({ ...prev, step: "loading", error: null }));

      try {
        const payload = buildInsightPayload(
          result,
          businessType,
          qualityIssues,
          true // consent granted
        );

        const res = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({})) as { error?: string };
          const message =
            errorBody.error ?? `Gagal mendapatkan insight (HTTP ${res.status}).`;
          setState((prev) => ({ ...prev, step: "error", error: message }));
          return;
        }

        const data: InsightResponse = await res.json() as InsightResponse;
        setState({ step: "done", response: data, error: null });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Gagal menghubungi server.";
        setState((prev) => ({ ...prev, step: "error", error: message }));
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState(createInitialState());
  }, []);

  return {
    state,
    requestConsent,
    cancelConsent,
    generateInsights,
    reset,
  };
}
