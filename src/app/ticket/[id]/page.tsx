import { createClient } from "@/lib/supabase/server";
import { getTodayWIB, SERVICE_COLORS } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const today = getTodayWIB();

  const { data: queue } = await supabase
    .from("queues")
    .select("*, service:services(*)")
    .eq("id", id)
    .single();

  if (!queue) notFound();

  // Count how many are waiting before this queue number
  const { count: waitingBefore } = await supabase
    .from("queues")
    .select("*", { count: "exact", head: true })
    .eq("service_id", queue.service_id)
    .eq("status", "waiting")
    .eq("date", today)
    .lt("queue_number", queue.queue_number);

  const hc = SERVICE_COLORS[queue.service?.code]?.gradient ?? "from-primary-500 to-primary-700";

  // Format date
  const dateObj = new Date(queue.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Format time
  const createdAt = new Date(queue.created_at);
  const formattedTime = createdAt.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-lg mx-auto text-center">
          {/* Ticket Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-slide-up">
            {/* Gradient Header */}
            <div className={`bg-gradient-to-br ${hc} px-6 py-8 text-white`}>
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Nomor Antrian Anda</p>
              <div className="mt-4 mb-2">
                <span className="text-7xl sm:text-8xl font-black tracking-tight pulse-glow inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4">
                  {queue.queue_code}
                </span>
              </div>
              <p className="text-white/80 text-sm mt-4">{queue.service?.name}</p>
            </div>

            {/* Ticket Body */}
            <div className="px-6 py-6">
              <div className="border-t-2 border-dashed border-slate-200 mb-6 -mx-6" />

              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">Nama</span>
                  <span className="text-sm font-semibold text-slate-800">{queue.visitor_name}</span>
                </div>
                {queue.institution && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-500">Instansi</span>
                    <span className="text-sm font-semibold text-slate-800">{queue.institution}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">Layanan</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {queue.service?.code} — {queue.service?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">Tanggal</span>
                  <span className="text-sm font-semibold text-slate-800">{formattedDate}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">Waktu Ambil</span>
                  <span className="text-sm font-semibold text-slate-800">{formattedTime} WIB</span>
                </div>
              </div>

              {/* Waiting Info */}
              <div className="mt-6 bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-600">
                    {waitingBefore && waitingBefore > 0 ? (
                      <><strong className="text-slate-800">{waitingBefore} orang</strong> menunggu sebelum Anda</>
                    ) : (
                      <>Anda antrian <strong className="text-accent-600">berikutnya!</strong></>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3 px-6 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-center"
            >
              ← Ambil Antrian Lagi
            </Link>
            <Link
              href="/monitor"
              className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl transition text-center"
            >
              Lihat Monitor →
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} — Sistem Antrian PST (Pelayanan Statistik Terpadu)
      </footer>
    </>
  );
}
