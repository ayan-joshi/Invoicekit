"use client";

import { Plus, Trash2, Info } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { TaxRule } from "@/lib/types";

interface Props {
  rules: TaxRule[];
  onChange: (rules: TaxRule[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function TaxRules({ rules, onChange, onBack, onNext }: Props) {
  function addRule() {
    onChange([...rules, { from: "", to: null, rate: 5 }]);
  }

  function updateRule(idx: number, key: keyof TaxRule, value: string | number | null) {
    const updated = rules.map((r, i) => (i === idx ? { ...r, [key]: value } : r));
    onChange(updated);
  }

  function removeRule(idx: number) {
    onChange(rules.filter((_, i) => i !== idx));
  }

  function isValid() {
    return rules.length > 0 && rules.every((r) => r.from && r.rate > 0);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">GST Tax Rules</h2>
        <p className="text-sm text-gray-500 mt-1">
          Map date ranges to GST rates. Orders within each range use the specified rate.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Example:</strong> If your product had 12% GST until 21 Sep 2025 and 5% after,
          add two rules: <em>from Aug 1 → Sep 21, rate 12%</em> and <em>from Sep 22 → open, rate 5%</em>.
          Leave &ldquo;To&rdquo; blank for an open-ended rule (applies to all future orders).
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_40px] gap-3 items-end bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <Input
              label="From Date"
              type="date"
              required
              value={rule.from}
              onChange={(e) => updateRule(idx, "from", e.target.value)}
            />
            <Input
              label="To Date (blank = open-ended)"
              type="date"
              value={rule.to || ""}
              onChange={(e) => updateRule(idx, "to", e.target.value || null)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                GST Rate (%) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={rule.rate}
                  onChange={(e) => updateRule(idx, "rate", parseFloat(e.target.value) || 0)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                />
                <span className="ml-1.5 text-gray-500 text-sm font-semibold">%</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRule(idx)}
              className="self-end h-10 w-10 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Remove rule"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRule}
        className="flex items-center gap-2 text-sm font-medium text-[#0f3460] hover:text-[#16213e] transition-colors"
      >
        <Plus className="w-4 h-4" /> Add tax rule
      </button>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!isValid()}>
          Next: Upload CSV →
        </Button>
      </div>
    </div>
  );
}
