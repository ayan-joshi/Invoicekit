"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { CompanyConfig, INDIAN_STATES } from "@/lib/types";

interface Props {
  company: CompanyConfig;
  onChange: (c: CompanyConfig) => void;
  logoFile: File | null;
  onLogoChange: (f: File | null) => void;
  onNext: () => void;
}

export function CompanySetup({ company, onChange, logoFile, onLogoChange, onNext }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  function set(key: keyof CompanyConfig, value: string | number) {
    // Auto-fill state code when state is selected
    if (key === "seller_state") {
      const match = INDIAN_STATES.find((s) => s.name === value);
      onChange({ ...company, seller_state: value as string, seller_state_code: match?.code || "" });
    } else {
      onChange({ ...company, [key]: value });
    }
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    onLogoChange(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    } else {
      setLogoPreview(null);
    }
  }

  function removeLogo() {
    onLogoChange(null);
    setLogoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function isValid() {
    return company.name && company.gstin && company.address && company.seller_state;
  }

  const exampleInvoiceNumber = `${company.invoice_prefix || "INV-"}${String(
    company.invoice_start_number || 1
  ).padStart(3, "0")}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Company Setup</h2>
        <p className="text-sm text-gray-500 mt-1">Your details appear on every invoice.</p>
      </div>

      {/* Logo upload */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Company Logo (optional)</label>
        {logoPreview ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoPreview} alt="Logo preview" className="h-16 object-contain border rounded-lg p-1 bg-white" />
            <Button variant="ghost" size="sm" onClick={removeLogo}>
              <X className="w-4 h-4" /> Remove
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl px-5 py-4 text-sm text-gray-500 hover:border-[#0f3460] hover:text-[#0f3460] transition-colors"
          >
            <Upload className="w-5 h-5" />
            Click to upload PNG / JPG
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoSelect} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          required
          value={company.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Aryan Traders Pvt Ltd"
        />
        <Input
          label="GSTIN"
          required
          value={company.gstin}
          onChange={(e) => set("gstin", e.target.value.toUpperCase())}
          placeholder="27AABCU9603R1ZX"
          maxLength={15}
        />
        <div className="sm:col-span-2">
          <Input
            label="Registered Address"
            required
            value={company.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="42, Nehru Nagar, Andheri East, Mumbai, Maharashtra 400069"
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={company.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="hello@aryantraders.com"
        />
        <Input
          label="Website"
          value={company.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="aryantraders.com"
        />

        {/* State selector */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Seller State <span className="text-red-500">*</span>
          </label>
          <select
            value={company.seller_state}
            onChange={(e) => set("seller_state", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
          >
            <option value="">Select state…</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="State Code (auto-filled)"
          value={company.seller_state_code}
          readOnly
          placeholder="06"
          className="bg-gray-50"
        />
        <Input
          label="HSN Code"
          value={company.hsn_code}
          onChange={(e) => set("hsn_code", e.target.value)}
          placeholder="621112"
          hint="Harmonised System Nomenclature code for your product"
        />
        <Input
          label="Transport Mode"
          value={company.transport_mode}
          onChange={(e) => set("transport_mode", e.target.value)}
          placeholder="Blue Dart"
        />
        <div className="sm:col-span-2">
          <Input
            label="Shipped From Address (optional)"
            value={company.shipped_from}
            onChange={(e) => set("shipped_from", e.target.value)}
            placeholder="Unit 7, MIDC Industrial Area, Andheri, Mumbai"
          />
        </div>
      </div>

      {/* Invoice Numbering */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Invoice Numbering</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Set a custom prefix and starting number. The counter auto-increments after each batch.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Invoice Prefix"
            value={company.invoice_prefix}
            onChange={(e) => set("invoice_prefix", e.target.value)}
            placeholder="INV-2025-"
            hint="e.g. INV-, INV-2025-, GST-"
          />
          <Input
            label="Starting Number"
            type="number"
            value={String(company.invoice_start_number)}
            onChange={(e) => set("invoice_start_number", Math.max(1, parseInt(e.target.value) || 1))}
            placeholder="1"
            hint="First invoice number in the next batch"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Preview:</span>
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
            {exampleInvoiceNumber}
          </span>
          <span className="text-gray-400">→ zero-padded to 3 digits</span>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!isValid()}>
          Next: Tax Rules →
        </Button>
      </div>
    </div>
  );
}
