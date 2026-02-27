import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

interface InvoiceBatch {
  id: string;
  created_at: string;
  order_count: number;
  format: string;
  prefix: string;
  from_number: number;
  to_number: number;
}

export default async function HistoryPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: batches } = await supabase
    .from("invoice_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/generate" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-[#0f3460] font-bold text-lg">
            <FileText className="w-5 h-5" />
            Invoice History
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {!batches || batches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            <p className="font-medium">No invoices generated yet.</p>
            <Link
              href="/generate"
              className="text-[#0f3460] text-sm mt-2 inline-block hover:underline"
            >
              Generate your first batch →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    Orders
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    Invoice Range
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">
                    Format
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(batches as InvoiceBatch[]).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700">
                      {new Date(b.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{b.order_count}</td>
                    <td className="px-5 py-3 font-mono text-gray-700">
                      {b.prefix}
                      {String(b.from_number).padStart(3, "0")} —{" "}
                      {b.prefix}
                      {String(b.to_number).padStart(3, "0")}
                    </td>
                    <td className="px-5 py-3 text-gray-500 uppercase text-xs">
                      {b.format}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
