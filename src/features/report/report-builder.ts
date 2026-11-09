// ===========================================
// DataInsight Mini — Report Builder
// ===========================================
// Client-side PDF generation using @react-pdf/renderer.
// Uses dynamic import to avoid SSR issues.

import type { ReportData } from "./report-types";

/**
 * Generate a PDF blob from report data.
 * This runs client-side only.
 */
export async function generateReportPDF(
  data: ReportData
): Promise<Blob> {
  // Validate required data
  if (data.analytics.rowCount === 0) {
    throw new Error("Tidak dapat membuat laporan dari analisis kosong.");
  }

  // Dynamic imports to avoid SSR issues with @react-pdf/renderer
  const [{ pdf }, { createElement }, { ReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("react"),
    import("./templates/report-document"),
  ]);

  // Create the PDF document element
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(ReportDocument, { data }) as any;

  // Generate PDF blob
  const blob = await pdf(element).toBlob();
  return blob;
}

/**
 * Generate and download a PDF report.
 */
export async function downloadReport(data: ReportData): Promise<void> {
  const blob = await generateReportPDF(data);

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildFileName(data);
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Build a safe file name for the report.
 */
function buildFileName(data: ReportData): string {
  const date = data.generatedAt
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const baseName = data.fileName
    .replace(/\.[^.]+$/, "") // Remove extension
    .replace(/[^a-zA-Z0-9_-]/g, "_") // Safe chars
    .slice(0, 30);

  const prefix = data.isDemo ? "DEMO_" : "";
  return `${prefix}DataInsight_${baseName}_${date}.pdf`;
}
