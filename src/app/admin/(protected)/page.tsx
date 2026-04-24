import { createClient } from "@/lib/supabase/server";
import { getTodayWIB, SERVICE_COLORS, STATUS_BADGE, STATUS_LABEL, type Queue } from "@/lib/types";
import Link from "next/link";
import { callNext, serveQueue, skipQueue, recallQueue } from "../actions";
import DateFilter from "../DateFilter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Panel — Antrian PST" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { date: rawDate } = await searchParams;
  const todayStr     = getTodayWIB();
  const selectedDate = rawDate ?? todayStr;
  const isToday      = selectedDate === todayStr;

  const supabase = await createClient();

  const [{ data: services }, { data: queuesRaw }] = await Promise.all([
    supabase.from("services").select().order("code"),
    supabase
      .from("queues")
      .select("*, service:services(*)")
      .eq("date", selectedDate)
      .order("service_id")
      .order("queue_number"),
  ]);

  const queues = (queuesRaw ?? []) as Queue[];

  // Group by service_id
  const grouped: Record<number, Queue[]> = {};
  for (const q of queues) {
    if (!grouped[q.service_id]) grouped[q.service_id] = [];
    grouped[q.service_id].push(q);
  }

  const stats = {
    total:   queues.length,
    waiting: queues.filter((q) => q.status === "waiting").length,
    called:  queues.filter((q) => q.status === "called").length,
    served:  queues.filter((q) => q.status === "served").length,
    skipped: queues.filter((q) => q.status === "skipped").length,
  };

  const statCards = [
    { label:"Total",     value:stats.total,   color:"bg-slate-100 text-slate-800", icon:"📊" },
    { label:"Menunggu",  value:stats.waiting, color:"bg-amber-50 text-amber-700",  icon:"⏳" },
    { label:"Dipanggil", value:stats.called,  color:"bg-blue-50 text-blue-700",    icon:"📢" },
    { label:"Selesai",   value:stats.served,  color:"bg-green-50 text-green-700",  icon:"✅" },
    { label:"Dilewati",  value:stats.skipped, color:"bg-red-50 text-red-700",      icon:"⏭️" },
  ];

  const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
          <p className="text-slate-500 text-sm">
            {isToday ? `Manajemen antrian hari ini — ${dateLabel}` : `📅 Riwayat antrian — ${dateLabel}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DateFilter selectedDate={selectedDate} maxDate={todayStr} />
          <Link href="/admin/history" className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-200 transition text-sm">
            📋 Riwayat
          </Link>
        </div>
      </div>

      {!isToday && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center text-sm">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          Anda sedang melihat riwayat tanggal <strong className="mx-1">{selectedDate}</strong>.
          <Link href="/admin" className="ml-2 underline font-semibold hover:text-amber-900">Kembali ke hari ini →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              <span className="text-2xl font-bold">{c.value}</span>
            </div>
            <p className="text-sm mt-1 opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Service Panels */}
      {(services ?? []).map((service) => {
        const sq = grouped[service.id] ?? [];
        const hc = SERVICE_COLORS[service.code]?.gradient ?? "from-primary-500 to-primary-600";

        return (
          <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${hc} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <span className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  {service.code}
                </span>
                <div className="text-white">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <p className="text-sm text-white/70">{sq.filter(q => q.status === "waiting").length} menunggu</p>
                </div>
              </div>
              {isToday && (
                <form action={callNext.bind(null, service.id)}>
                  <button type="submit" className="px-5 py-2.5 bg-white text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm transform hover:-translate-y-0.5">
                    📢 Panggil Berikutnya
                  </button>
                </form>
              )}
            </div>

            {sq.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Antrian</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Instansi</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                      {isToday && <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sq.map((q) => (
                      <tr key={q.id} className={`hover:bg-slate-50/50 transition ${q.status === "called" ? "bg-blue-50/50" : ""}`}>
                        <td className="px-6 py-3.5">
                          <span className="font-bold text-lg text-slate-800">{q.queue_code}</span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-700">{q.visitor_name}</td>
                        <td className="px-6 py-3.5 text-sm text-slate-500">{q.institution ?? "—"}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_BADGE[q.status]}`}>
                            {STATUS_LABEL[q.status]}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-500">
                          {new Date(q.created_at).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", timeZone:"Asia/Jakarta" })}
                          {q.called_at && <><br /><span className="text-xs text-blue-500">📢 {new Date(q.called_at).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", timeZone:"Asia/Jakarta" })}</span></>}
                          {q.served_at && <><br /><span className="text-xs text-green-500">✅ {new Date(q.served_at).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", timeZone:"Asia/Jakarta" })}</span></>}
                        </td>
                        {isToday && (
                          <td className="px-6 py-3.5 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {q.status === "called" && (<>
                                <form action={serveQueue.bind(null, q.id)}><button type="submit" className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition border border-green-200">✅ Selesai</button></form>
                                <form action={skipQueue.bind(null, q.id)}><button type="submit" className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition border border-red-200">⏭️ Skip</button></form>
                              </>)}
                              {q.status === "skipped" && <form action={recallQueue.bind(null, q.id)}><button type="submit" className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold hover:bg-amber-100 transition border border-amber-200">🔁 Recall</button></form>}
                              {q.status === "waiting" && <span className="text-xs text-slate-400">Menunggu</span>}
                              {q.status === "served"  && <span className="text-xs text-slate-400">—</span>}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-slate-400">
                <p className="text-sm">Belum ada antrian untuk layanan ini</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
