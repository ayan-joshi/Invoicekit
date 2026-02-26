import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvoiceKit — Bulk GST Invoices for Indian Shopify Sellers",
  description:
    "Upload your Shopify order CSV and generate bulk GST-compliant PDF invoices in seconds. CGST/SGST/IGST auto-detection, date-range tax rules, no signup required.",
  keywords: ["GST invoice", "Shopify", "India", "bulk invoice", "CGST", "SGST", "IGST"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
