// ===========================================
// DataInsight Mini — Import Service
// ===========================================
// Orchestrates the full import pipeline:
// validate → parse → profile.
// All processing happens in the browser.

import type {
  ImportState,
  ParseResult,
  DataProfile,
  SupportedExtension,
} from "./import-types";
import { validateFile, validateDimensions } from "./file-validator";
import { parseFile, getSheetNames } from "./file-parser";
import { profileData } from "../data-profiling/profile-engine";

/**
 * Create a fresh import state.
 */
export function createInitialImportState(): ImportState {
  return {
    step: "idle",
    file: null,
    parseResult: null,
    profile: null,
    error: null,
    availableSheets: [],
    selectedSheet: null,
  };
}

/**
 * Run the full import pipeline for a file.
 *
 * Returns the final ImportState after each stage.
 * The onProgress callback is called after each step so the UI can update.
 */
export async function importFile(
  file: File,
  onProgress?: (state: ImportState) => void,
  sheetName?: string
): Promise<ImportState> {
  let state: ImportState = {
    ...createInitialImportState(),
    file,
    step: "validating",
  };
  onProgress?.(state);

  // Step 1: Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    state = { ...state, step: "error", error: validation.error ?? "Validasi gagal." };
    onProgress?.(state);
    return state;
  }

  const extension = validation.extension as SupportedExtension;

  // For XLSX, get available sheets first
  if (extension === ".xlsx" && !sheetName) {
    try {
      const buffer = await file.arrayBuffer();
      const sheets = getSheetNames(buffer);
      state = { ...state, availableSheets: sheets };
      if (sheets.length > 1) {
        // If multiple sheets, let the caller choose (default to first)
        state = { ...state, selectedSheet: sheets[0] };
      }
    } catch {
      // Non-critical — proceed with default sheet
    }
  }

  // Step 2: Parse file
  state = { ...state, step: "parsing" };
  onProgress?.(state);

  let parseResult: ParseResult;
  try {
    parseResult = await parseFile(file, extension, sheetName ?? state.selectedSheet ?? undefined);
  } catch {
    state = { ...state, step: "error", error: "Gagal memproses file." };
    onProgress?.(state);
    return state;
  }

  if (!parseResult.success) {
    state = {
      ...state,
      step: "error",
      error: parseResult.error ?? "Gagal memproses file.",
      parseResult,
    };
    onProgress?.(state);
    return state;
  }

  // Step 2b: Validate dimensions
  const dimCheck = validateDimensions(parseResult.rowCount, parseResult.columnCount);
  if (!dimCheck.valid) {
    state = {
      ...state,
      step: "error",
      error: dimCheck.error ?? "Data melebihi batas.",
      parseResult,
    };
    onProgress?.(state);
    return state;
  }

  state = {
    ...state,
    parseResult,
    availableSheets: parseResult.sheetNames ?? [],
    selectedSheet: parseResult.selectedSheet ?? null,
  };

  // Step 3: Profile data
  state = { ...state, step: "profiling" };
  onProgress?.(state);

  let profile: DataProfile;
  try {
    profile = profileData(parseResult);
    profile.fileName = file.name;
    profile.fileSize = file.size;
  } catch {
    state = { ...state, step: "error", error: "Gagal menganalisis data." };
    onProgress?.(state);
    return state;
  }

  // Done
  state = {
    ...state,
    step: "ready",
    profile,
    error: null,
  };
  onProgress?.(state);
  return state;
}
