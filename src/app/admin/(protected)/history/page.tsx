import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Riwayat Antrian — Admin PST" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const PER_PAGE = 15;

export default async function HistoryPage({ searchParams }: PageProps) {
  const { page: rawPage } = await searchParams;
  const page   = Math.max(1, parseInt(rawPage ?? "1"));
  const offset = (page - 1) * PER_PAGE;

  const supabase = await createClient();

  const { data: records } = await supabase
    .from("queue_history_summary")
    .select("*")
    .order("date", { ascending: false })
    .range(offset, offset + PER_PAGE - 1);

  const { count: total } = await supabase
    .from("queue_history_summary")
    .select("*", { count: "exact", head: true });

  const totalPages = Math.ceil((total ?? 0) / PER_PAGE);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">📋 Riwayat Antrian</h2>
          <p className="text-slate-500 text-sm">Daftar semua tanggal yang memiliki catatan antrian</p>
        </div>
        <Link href="/admin" className="px-4 py-2.5 bg-primary-50 text-primary-700 font-semibold rounded-xl border border-primary-200 hover:bg-primary-100 transition text-sm">
          ← Kembali ke Hari Ini
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Dilewati</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(records ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Belum ada riwayat antrian</p>
                </td>
              </tr>
            ) : (records ?? []).map((rec) => {
              const isToday  = rec.date === today;
              const dateObj  = new Date(rec.date + "T00:00:00");
              const weekday  = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
              const fullDate = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
              return (
                <tr key={rec.date} className={`hover:bg-slate-50/50 transition ${isToday ? "bg-primary-50/30" : ""}`}>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800 capitalize">{weekday}</span>
                    {isToday && <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-md text-xs font-semibold">Hari ini</span>}
                    <p className="text-sm text-slate-500">{fullDate}</p>
                  </td>
                  <td className="px-6 py-4 text-center"><span className="text-lg font-bold text-slate-800">{rec.total}</span></td>
                  <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">✅ {rec.served}</span></td>
                  <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">⏳ {rec.waiting}</span></td>
                  <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">⏭️ {rec.skipped}</span></td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/admin?date=${rec.date}`} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                      👁️ Lihat Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && <Link href={`?page=${page - 1}`} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">← Prev</Link>}
          <span className="px-4 py-2 text-sm text-slate-500">Halaman {page} / {totalPages}</span>
          {page < totalPages && <Link href={`?page=${page + 1}`} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">Next →</Link>}
        </div>
      )}
    </div>
  );
}
