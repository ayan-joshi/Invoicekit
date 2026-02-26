"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { InvoiceConfig } from "@/lib/types";
import { fetchPreview, checkHealth } from "@/lib/api";

interface Props {
  csvFile: File;
  config: InvoiceConfig;
  logoFile: File | null;
  onBack: () => void;
  onNext: () => void;
}

export function Preview({ csvFile, config, logoFile, onBack, onNext }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wakingUp, setWakingUp] = useState(false);

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    setPdfUrl(null);

    // Check if server is alive — show "waking up" message for cold starts
    const alive = await checkHealth();
    if (!alive) {
      setWakingUp(true);
      // Wait a bit and retry health (Render cold start ~8–15s)
      await new Promise((r) => setTimeout(r, 10_000));
      setWakingUp(false);
    }

    try {
      const url = await fetchPreview(csvFile, config, logoFile);
      setPdfUrl(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Preview failed. Please check your config.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
        <p className="text-sm text-gray-500 mt-1">
          This is the first order from your CSV. Verify before bulk generation.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 h-96 bg-gray-50 rounded-2xl border border-gray-200">
          <svg className="animate-spin h-10 w-10 text-[#0f3460]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm text-gray-600 font-medium">
            {wakingUp ? "Waking up server… (first request may take ~15s)" : "Generating preview…"}
          </p>
          {wakingUp && (
            <p className="text-xs text-gray-400">Render free tier spins down after inactivity.</p>
          )}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Preview failed</p>
              <p className="mt-0.5 text-red-600">{error}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={loadPreview} size="sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      )}

      {/* PDF preview */}
      {!loading && pdfUrl && (
        <iframe
          src={pdfUrl}
          className="w-full rounded-2xl border border-gray-200 shadow-sm"
          style={{ height: "600px" }}
          title="Invoice preview"
        />
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <div className="flex gap-3">
          {!loading && (
            <Button variant="ghost" size="sm" onClick={loadPreview}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          )}
          <Button onClick={onNext} disabled={loading || !!error}>
            Generate All →
          </Button>
        </div>
      </div>
    </div>
  );
}
