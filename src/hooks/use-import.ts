// ===========================================
// DataInsight Mini — useImport Hook
// ===========================================
// React hook for managing the file import flow.

"use client";

import { useState, useCallback } from "react";
import type { ImportState } from "@/features/data-import/import-types";
import {
  importFile,
  createInitialImportState,
} from "@/features/data-import/import-service";

export function useImport() {
  const [state, setState] = useState<ImportState>(createInitialImportState());

  const handleFile = useCallback(async (file: File) => {
    const result = await importFile(file, (progress) => {
      setState({ ...progress });
    });
    setState({ ...result });
  }, []);

  const handleSheetChange = useCallback(
    async (sheetName: string) => {
      if (!state.file) return;
      setState((prev) => ({ ...prev, selectedSheet: sheetName, step: "parsing" }));
      const result = await importFile(state.file, (progress) => {
        setState({ ...progress });
      }, sheetName);
      setState({ ...result });
    },
    [state.file]
  );

  const reset = useCallback(() => {
    setState(createInitialImportState());
  }, []);

  return {
    state,
    handleFile,
    handleSheetChange,
    reset,
  };
}
