// ===========================================
// DataInsight Mini — Upload Zone Component
// ===========================================
// Drag-and-drop file upload with validation.

"use client";

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_EXTENSIONS } from "@/features/data-import/import-types";
import { validateFile } from "@/features/data-import/file-validator";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  isProcessing: boolean;
  error: string | null;
}

export function UploadZone({
  onFileSelected,
  onClear,
  selectedFile,
  isProcessing,
  error,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const acceptStr = SUPPORTED_EXTENSIONS.join(",");

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        // Let parent handle the error via the import service
        // but still pass the file for the full pipeline
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-12",
          isProcessing && "pointer-events-none opacity-60",
          isDragOver
            ? "border-accent-500 bg-accent-50"
            : selectedFile
              ? "border-success/50 bg-success/5"
              : "border-border bg-muted hover:border-navy-300 hover:bg-navy-50/50",
          error && !selectedFile && "border-danger/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {!selectedFile && (
          <input
            type="file"
            accept={acceptStr}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleInputChange}
            aria-label="Upload file"
          />
        )}

        {selectedFile ? (
          <>
            <FileSpreadsheet className="mb-3 h-10 w-10 text-success" />
            <p className="text-sm font-semibold text-navy-900">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </p>
            {!isProcessing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="mt-3 inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Ganti file
              </button>
            )}
          </>
        ) : (
          <>
            <Upload
              className={cn(
                "mb-3 h-10 w-10",
                isDragOver ? "text-accent-500" : "text-muted-foreground"
              )}
            />
            <p className="text-sm font-semibold text-navy-900">
              Seret file ke sini atau klik untuk memilih
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Format: {SUPPORTED_EXTENSIONS.join(", ")} &bull; Maks 5 MB
            </p>
          </>
        )}

        {isProcessing && (
          <div className="mt-3 flex items-center gap-2 text-xs text-accent-600">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-600 border-t-transparent" />
            Memproses file...
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
