// ===========================================
// DataInsight Mini — File Validator
// ===========================================
// Validates file before parsing: size, extension, MIME type.
// Runs in the browser, no server involved.

import {
  MAX_FILE_SIZE_BYTES,
  MAX_ROW_COUNT,
  MAX_COLUMN_COUNT,
} from "@/lib/utils/constants";
import type { FileValidationResult, SupportedExtension } from "./import-types";
import { SUPPORTED_EXTENSIONS } from "./import-types";

/**
 * Extract file extension (lowercase, with dot).
 */
function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return fileName.slice(dotIndex).toLowerCase();
}

/**
 * Validate a file for import.
 * Checks: existence, size, extension.
 */
export function validateFile(file: File): FileValidationResult {
  const fileName = file.name;
  const fileSize = file.size;
  const ext = getExtension(fileName);

  // Check empty file
  if (fileSize === 0) {
    return {
      valid: false,
      error: "File kosong. Silakan pilih file yang berisi data.",
      fileName,
      fileSize,
      extension: null,
    };
  }

  // Check file size
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    const maxMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    const fileMB = (fileSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Ukuran file (${fileMB} MB) melebihi batas ${maxMB} MB.`,
      fileName,
      fileSize,
      extension: null,
    };
  }

  // Check extension
  if (!SUPPORTED_EXTENSIONS.includes(ext as SupportedExtension)) {
    return {
      valid: false,
      error: `Format file "${ext || "(tanpa ekstensi)"}" tidak didukung. Gunakan: ${SUPPORTED_EXTENSIONS.join(", ")}`,
      fileName,
      fileSize,
      extension: null,
    };
  }

  return {
    valid: true,
    fileName,
    fileSize,
    extension: ext as SupportedExtension,
  };
}

/**
 * Validate parsed data dimensions.
 */
export function validateDimensions(
  rowCount: number,
  columnCount: number
): { valid: boolean; error?: string } {
  if (rowCount === 0) {
    return { valid: false, error: "File tidak memiliki data. Pastikan file berisi minimal 1 baris data selain header." };
  }

  if (rowCount > MAX_ROW_COUNT) {
    return {
      valid: false,
      error: `Jumlah baris (${rowCount.toLocaleString("id-ID")}) melebihi batas ${MAX_ROW_COUNT.toLocaleString("id-ID")} baris.`,
    };
  }

  if (columnCount > MAX_COLUMN_COUNT) {
    return {
      valid: false,
      error: `Jumlah kolom (${columnCount}) melebihi batas ${MAX_COLUMN_COUNT} kolom.`,
    };
  }

  if (columnCount === 0) {
    return { valid: false, error: "File tidak memiliki kolom. Pastikan baris pertama berisi header kolom." };
  }

  return { valid: true };
}
