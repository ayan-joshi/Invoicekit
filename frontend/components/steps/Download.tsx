"use client";

import { useState } from "react";
import { Download as DownloadIcon, FileText, Archive, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { InvoiceConfig } from "@/lib/types";
import { generateInvoices } from "@/lib/api";
import { clsx } from "clsx";

interface Props {
  csvFile: File;
  config: InvoiceConfig;
  logoFile: File | null;
  orderCount: number | null;
  onBack: () => void;
}

type Format = "zip" | "single";

export function Download({ csvFile, config, logoFile, orderCount, onBack }: Props) {
  const [format, setFormat] = useState<Format>("zip");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setDone(false);
    try {
      const blob = await generateInvoices(csvFile, config, logoFile, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "zip" ? "invoices.zip" : "invoices.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Generate & Download</h2>
        <p className="text-sm text-gray-500 mt-1">
          {orderCount ? `Ready to generate ${orderCount} invoices.` : "Ready to generate invoices."}
          {config.company.invoice_prefix && (
            <span className="ml-1 text-gray-400">
              Starting from{" "}
              <span className="font-mono text-gray-600">
                {config.company.invoice_prefix}
                {String(config.company.invoice_start_number || 1).padStart(3, "0")}
              </span>
            </span>
          )}
        </p>
      </div>

      {/* Format selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            id: "zip" as Format,
            icon: Archive,
            title: "ZIP of individual PDFs",
            desc: "One PDF per order, bundled in a .zip file. Best for accountants.",
          },
          {
            id: "single" as Format,
            icon: FileText,
            title: "Single merged PDF",
            desc: "All invoices in one PDF, page per order. Good for printing.",
          },
        ].map(({ id, icon: Icon, title, desc }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFormat(id)}
            className={clsx(
              "flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all",
              format === id
                ? "border-[#0f3460] bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div
              className={clsx(
                "rounded-xl p-2.5 flex-shrink-0",
                format === id ? "bg-[#0f3460] text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className={clsx("font-semibold text-sm", format === id ? "text-[#0f3460]" : "text-gray-800")}>
                {title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Success message */}
      {done && (
        <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Download started!</p>
            <p className="text-green-600">Your file has been downloaded. Check your downloads folder.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Note for large batches */}
      {orderCount && orderCount > 500 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Large batch ({orderCount} orders) — generation may take 30–60 seconds. Please wait.
        </p>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack} disabled={loading}>← Back</Button>
        <Button onClick={handleGenerate} loading={loading} size="lg">
          <DownloadIcon className="w-5 h-5" />
          {loading
            ? "Generating…"
            : `Download ${format === "zip" ? "ZIP" : "PDF"}`}
        </Button>
      </div>

      {done && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => { setDone(false); onBack(); }}>
            ← Start over with a new file
          </Button>
        </div>
      )}
    </div>
  );
}
