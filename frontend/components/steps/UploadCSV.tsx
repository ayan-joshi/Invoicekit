"use client";

import { useRef, useState, DragEvent } from "react";
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { countOrders } from "@/lib/api";
import { clsx } from "clsx";

interface Props {
  csvFile: File | null;
  orderCount: number | null;
  onFileChange: (file: File | null, count: number | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export function UploadCSV({ csvFile, orderCount, onFileChange, onBack, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function processFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const count = await countOrders(file);
      onFileChange(file, count);
    } catch (e) {
      setError("Failed to parse CSV. Make sure it's a Shopify order export.");
      onFileChange(file, null);
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Upload Shopify Order CSV</h2>
        <p className="text-sm text-gray-500 mt-1">
          Export from Shopify Admin → Orders → Export → All orders (CSV for Excel).
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
          dragging
            ? "border-[#0f3460] bg-blue-50"
            : csvFile
            ? "border-green-400 bg-green-50"
            : "border-gray-300 hover:border-[#0f3460] hover:bg-gray-50"
        )}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />

        {csvFile ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <p className="font-semibold text-gray-800">{csvFile.name}</p>
            <p className="text-sm text-gray-500">
              {(csvFile.size / 1024).toFixed(0)} KB
              {orderCount !== null && ` · ${orderCount} orders found`}
            </p>
            <p className="text-xs text-gray-400">Click to replace</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-10 w-10 text-[#0f3460]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-gray-500">Counting orders…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-gray-400" />
            <div>
              <p className="font-semibold text-gray-700">Drag & drop your CSV here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border rounded-full px-3 py-1">
              <FileText className="w-3 h-3" /> Shopify order export .csv
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!csvFile || loading}>
          Next: Preview →
        </Button>
      </div>
    </div>
  );
}
