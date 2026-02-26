// API client for InvoiceKit backend

import { InvoiceConfig } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function buildFormData(
  csvFile: File,
  config: InvoiceConfig,
  logoFile: File | null,
  extra?: Record<string, string>
): FormData {
  const fd = new FormData();
  fd.append("csv_file", csvFile);
  fd.append("config_json", JSON.stringify(config));
  if (logoFile) fd.append("logo_file", logoFile);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) fd.append(k, v);
  }
  return fd;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function countOrders(csvFile: File): Promise<number> {
  const fd = new FormData();
  fd.append("csv_file", csvFile);
  const res = await fetch(`${API_URL}/count`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Failed to count orders");
  const data = await res.json();
  return data.count;
}

export async function fetchPreview(
  csvFile: File,
  config: InvoiceConfig,
  logoFile: File | null
): Promise<string> {
  const fd = buildFormData(csvFile, config, logoFile);
  const res = await fetch(`${API_URL}/preview`, { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Preview failed" }));
    throw new Error(err.detail || "Preview failed");
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function generateInvoices(
  csvFile: File,
  config: InvoiceConfig,
  logoFile: File | null,
  format: "single" | "zip"
): Promise<Blob> {
  const fd = buildFormData(csvFile, config, logoFile, { format });
  const res = await fetch(`${API_URL}/generate`, { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Generation failed" }));
    throw new Error(err.detail || "Generation failed");
  }
  return res.blob();
}
