import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvoiceKit — Bulk GST Invoices for Indian Shopify Sellers",
  description:
    "Upload your Shopify order CSV and generate bulk GST-compliant PDF invoices in seconds. CGST/SGST/IGST auto-detection, date-range tax rules, no signup required.",
  keywords: ["GST invoice", "Shopify", "India", "bulk invoice", "CGST", "SGST", "IGST"],
  openGraph: {
    title: "InvoiceKit — Bulk GST Invoices for Indian Shopify Sellers",
    description:
      "Generate 1,000+ GST-compliant invoices from your Shopify order CSV in under a minute. CGST/SGST/IGST auto-detection. Free to start.",
    type: "website",
    locale: "en_IN",
    siteName: "InvoiceKit",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoiceKit — Bulk GST Invoices for Indian Shopify Sellers",
    description:
      "Generate 1,000+ GST-compliant invoices from your Shopify order CSV in under a minute.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
