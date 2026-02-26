"use client";

import { useCallback, useEffect, useState } from "react";
import { StepBar } from "@/components/ui/StepBar";
import { CompanySetup } from "@/components/steps/CompanySetup";
import { TaxRules } from "@/components/steps/TaxRules";
import { UploadCSV } from "@/components/steps/UploadCSV";
import { Preview } from "@/components/steps/Preview";
import { Download } from "@/components/steps/Download";
import { CompanyConfig, DEFAULT_COMPANY, InvoiceConfig, TaxRule, WizardStep } from "@/lib/types";
import Link from "next/link";
import { FileText } from "lucide-react";

const LS_COMPANY = "ik_company";
const LS_RULES = "ik_tax_rules";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function GeneratePage() {
  const [step, setStep] = useState<WizardStep>(1);
  const [company, setCompany] = useState<CompanyConfig>(DEFAULT_COMPANY);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  // Load persisted config on mount
  useEffect(() => {
    setCompany(loadFromStorage(LS_COMPANY, DEFAULT_COMPANY));
    setTaxRules(loadFromStorage(LS_RULES, []));
  }, []);

  // Persist whenever changed
  const saveCompany = useCallback((c: CompanyConfig) => {
    setCompany(c);
    localStorage.setItem(LS_COMPANY, JSON.stringify(c));
  }, []);

  const saveRules = useCallback((r: TaxRule[]) => {
    setTaxRules(r);
    localStorage.setItem(LS_RULES, JSON.stringify(r));
  }, []);

  function handleFileChange(file: File | null, count: number | null) {
    setCsvFile(file);
    setOrderCount(count);
  }

  const config: InvoiceConfig = { company, tax_rules: taxRules };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#0f3460] font-bold text-lg">
            <FileText className="w-5 h-5" />
            InvoiceKit
          </Link>
          <span className="text-xs text-gray-500">Step {step} of 5</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Progress bar */}
        <div className="mb-8">
          <StepBar current={step} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {step === 1 && (
            <CompanySetup
              company={company}
              onChange={saveCompany}
              logoFile={logoFile}
              onLogoChange={setLogoFile}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <TaxRules
              rules={taxRules}
              onChange={saveRules}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <UploadCSV
              csvFile={csvFile}
              orderCount={orderCount}
              onFileChange={handleFileChange}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && csvFile && (
            <Preview
              csvFile={csvFile}
              config={config}
              logoFile={logoFile}
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
            />
          )}
          {step === 5 && csvFile && (
            <Download
              csvFile={csvFile}
              config={config}
              logoFile={logoFile}
              orderCount={orderCount}
              onBack={() => setStep(4)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
