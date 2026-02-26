import Link from "next/link";
import { FileText, Upload, Eye, Download, CheckCircle, Zap, ShieldCheck, Package } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-20">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#0f3460] font-bold text-xl">
            <FileText className="w-6 h-6" />
            InvoiceKit
          </div>
          <Link
            href="/generate"
            className="bg-[#0f3460] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#16213e] transition-colors"
          >
            Get Started Free →
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <Zap className="w-3 h-3" /> Built for Indian Shopify sellers
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            Bulk GST Invoices from{" "}
            <span className="text-[#e94560]">Shopify CSV</span>
            <br />in seconds.
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Upload your Shopify order export, configure your GSTIN & tax rules once, and download
            perfect CGST/SGST/IGST compliant invoices — all without any coding or accounting software.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/generate"
              className="bg-[#e94560] hover:bg-[#c73652] text-white font-bold text-base px-8 py-4 rounded-xl transition-colors shadow-lg"
            >
              Generate Invoices — Free
            </Link>
            <a
              href="#how-it-works"
              className="border border-white/30 text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
            >
              See how it works
            </a>
          </div>
          <p className="text-xs text-white/40 mt-6">No signup. No subscription. No data stored.</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Everything you need for GST compliance
        </h2>
        <p className="text-center text-gray-500 mb-12">
          Built around the exact pain points of selling on Shopify in India.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "CGST / SGST / IGST auto-detection",
              desc: "We check the buyer's state vs. your seller state and apply the correct split automatically.",
            },
            {
              icon: Package,
              title: "Date-range GST rate rules",
              desc: "Handle rate changes effortlessly — set 12% until Sep 2025 and 5% after. We apply the right rate per order.",
            },
            {
              icon: FileText,
              title: "Bulk PDF generation",
              desc: "Generate 1,700 invoices in under a minute. Download a ZIP of individual PDFs or one merged PDF.",
            },
            {
              icon: Upload,
              title: "Works with Shopify CSV",
              desc: "Export directly from Shopify Admin → Orders → Export. No reformatting needed.",
            },
            {
              icon: Eye,
              title: "Preview before bulk generate",
              desc: "See the rendered invoice for your first order before generating the full batch.",
            },
            {
              icon: CheckCircle,
              title: "No data stored, ever",
              desc: "Your CSV and company details are processed in memory and discarded. Nothing is saved on our servers.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-[#0f3460]/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#0f3460]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-gray-50 border-y border-gray-100 py-20"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">How it works</h2>
          <p className="text-center text-gray-500 mb-12">Five steps, under two minutes.</p>
          <div className="space-y-6">
            {[
              {
                n: 1,
                title: "Enter your company details",
                desc: "GSTIN, registered address, seller state, HSN code, logo. Saved in your browser for next time.",
              },
              {
                n: 2,
                title: "Set your GST rate rules",
                desc: "Map date ranges to GST rates. Handle historical rate changes with multiple rules.",
              },
              {
                n: 3,
                title: "Upload your Shopify CSV",
                desc: "Drag & drop the order export CSV. We count orders and validate the format.",
              },
              {
                n: 4,
                title: "Preview your first invoice",
                desc: "See a rendered PDF for order #1 — verify logo, layout, and tax figures look correct.",
              },
              {
                n: 5,
                title: "Download all invoices",
                desc: "Choose ZIP (one PDF per order) or single merged PDF. Click generate and download.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-[#0f3460] text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  {n}
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-4">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Ready to stop doing invoices manually?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Takes 2 minutes to set up. Works for any Indian state. Free, forever.
        </p>
        <Link
          href="/generate"
          className="inline-block bg-[#0f3460] hover:bg-[#16213e] text-white font-bold text-lg px-10 py-4 rounded-xl transition-colors shadow-lg"
        >
          Generate Invoices — Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2 font-semibold text-gray-600">
            <FileText className="w-4 h-4" />
            InvoiceKit
          </div>
          <p>GST Invoice Generator for Indian Shopify Sellers</p>
        </div>
      </footer>
    </div>
  );
}
