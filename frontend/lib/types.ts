// Shared TypeScript types for InvoiceKit frontend

export interface CompanyConfig {
  name: string;
  gstin: string;
  address: string;
  email: string;
  website: string;
  seller_state: string;
  seller_state_code: string;
  shipped_from: string;
  hsn_code: string;
  transport_mode: string;
  invoice_prefix: string;
  invoice_start_number: number;
}

export interface TaxRule {
  from: string;       // ISO date "YYYY-MM-DD"
  to: string | null;  // ISO date or null (open-ended)
  rate: number;       // GST % e.g. 5 or 12
}

export interface InvoiceConfig {
  company: CompanyConfig;
  tax_rules: TaxRule[];
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface WizardState {
  step: WizardStep;
  company: CompanyConfig;
  taxRules: TaxRule[];
  csvFile: File | null;
  logoFile: File | null;
  orderCount: number | null;
}

// Default empty company
export const DEFAULT_COMPANY: CompanyConfig = {
  name: "",
  gstin: "",
  address: "",
  email: "",
  website: "",
  seller_state: "",
  seller_state_code: "",
  shipped_from: "",
  hsn_code: "",
  transport_mode: "Courier",
  invoice_prefix: "INV-",
  invoice_start_number: 1,
};

// Indian states list for dropdown
export const INDIAN_STATES: { name: string; code: string }[] = [
  { name: "Andhra Pradesh", code: "37" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Assam", code: "18" },
  { name: "Bihar", code: "10" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Delhi", code: "07" },
  { name: "Goa", code: "30" },
  { name: "Gujarat", code: "24" },
  { name: "Haryana", code: "06" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jharkhand", code: "20" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Maharashtra", code: "27" },
  { name: "Manipur", code: "14" },
  { name: "Meghalaya", code: "17" },
  { name: "Mizoram", code: "15" },
  { name: "Nagaland", code: "13" },
  { name: "Odisha", code: "21" },
  { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" },
  { name: "Sikkim", code: "11" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Tripura", code: "16" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Uttarakhand", code: "05" },
  { name: "West Bengal", code: "19" },
];
