"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTodayWIB, SERVICE_COLORS, type Queue, type Service } from "@/lib/types";
import Link from "next/link";

interface Props {
  initialCalledQueues:  Queue[];
  initialWaitingQueues: Queue[];
  services:             Service[];
}

export default function MonitorDisplay({
  initialCalledQueues,
  initialWaitingQueues,
  services,
}: Props) {
  const [calledQueues,  setCalledQueues]  = useState<Queue[]>(initialCalledQueues);
  const [waitingQueues, setWaitingQueues] = useState<Queue[]>(initialWaitingQueues);
  const [clock,         setClock]         = useState("");
  const [dateStr,       setDateStr]       = useState("");
  const fetchRef = useRef(false);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = { timeZone: "Asia/Jakarta" };
      setClock(now.toLocaleTimeString("id-ID", { ...opts, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateStr(now.toLocaleDateString("id-ID", { ...opts, weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch queues from Supabase
  const fetchQueues = async () => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    const supabase = createClient();
    const today = getTodayWIB();

    const [{ data: called }, { data: waiting }] = await Promise.all([
      supabase.from("queues").select("*, service:services(*)").eq("date", today).eq("status", "called").order("called_at", { ascending: false }),
      supabase.from("queues").select("*, service:services(*)").eq("date", today).eq("status", "waiting").order("queue_number", { ascending: true }),
    ]);

    setCalledQueues(called ?? []);
    setWaitingQueues(waiting ?? []);
    fetchRef.current = false;
  };

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("monitor-queues")
      .on("postgres_changes", { event: "*", schema: "public", table: "queues" }, () => {
        fetchQueues();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group waiting by service
  const waitingByService: Record<number, Queue[]> = {};
  for (const q of waitingQueues) {
    if (!waitingByService[q.service_id]) waitingByService[q.service_id] = [];
    waitingByService[q.service_id].push(q);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header Bar */}
      <div className="bg-black/30 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">Monitor Antrian PST</h1>
            <p className="text-xs text-slate-400">Pelayanan Statistik Terpadu</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums">{clock}</div>
          <div className="text-sm text-slate-400 capitalize">{dateStr}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
        {/* Currently Called */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-slate-300 uppercase tracking-wider flex items-center">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-blink" />
            Sedang Dipanggil
          </h2>

          {calledQueues.length > 0 ? (
            <div className={`grid gap-4 flex-1 ${calledQueues.length >= 3 ? "grid-cols-3" : calledQueues.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {calledQueues.map((q) => {
                const c = SERVICE_COLORS[q.service?.code ?? "A"];
                return (
                  <div key={q.id} className={`bg-gradient-to-br ${c.card} border rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-slide-in pulse-glow`}>
                    <span className="text-sm font-medium text-slate-300 uppercase tracking-widest mb-2">
                      {q.service?.name}
                    </span>
                    <div className="my-4">
                      <span className={`text-8xl lg:text-9xl font-black bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
                        {q.queue_code}
                      </span>
                    </div>
                    <p className="text-slate-400 text-lg">{q.visitor_name}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <svg className="w-20 h-20 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-2xl font-semibold">Belum Ada Antrian Dipanggil</p>
                <p className="text-slate-600 mt-1">Silakan menunggu...</p>
              </div>
            </div>
          )}
        </div>

        {/* Waiting Queue Sidebar */}
        <div className="lg:w-1/3 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Antrian Menunggu
          </h2>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex-1 overflow-hidden">
            <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
              {services.map((service) => {
                const sq = waitingByService[service.id] ?? [];
                if (sq.length === 0) return null;
                const tc = SERVICE_COLORS[service.code]?.text ?? "text-slate-400";
                return sq.slice(0, 5).map((wq) => (
                  <div key={wq.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xl font-bold ${tc}`}>{wq.queue_code}</span>
                    </div>
                    <span className="text-sm text-slate-500">{wq.visitor_name}</span>
                  </div>
                ));
              })}

              {waitingQueues.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm">Tidak ada antrian menunggu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/20 border-t border-white/10 px-6 py-3 flex justify-between items-center text-sm text-slate-500">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live — update otomatis
        </span>
        <div className="flex space-x-4">
          <Link href="/" className="hover:text-white transition">Ambil Antrian</Link>
          <Link href="/admin" className="hover:text-white transition">Admin Panel</Link>
        </div>
      </div>
    </div>
  );
}
