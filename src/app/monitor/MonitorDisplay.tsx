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

  // Supabase Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("monitor-queues")
      .on("postgres_changes", { event: "*", schema: "public", table: "queues" }, () => fetchQueues())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waitingByService: Record<number, Queue[]> = {};
  for (const q of waitingQueues) {
    if (!waitingByService[q.service_id]) waitingByService[q.service_id] = [];
    waitingByService[q.service_id].push(q);
  }

  const serviceColorMap: Record<string, { header: string; number: string; badge: string }> = {
    A: { header: "bg-blue-500",    number: "text-blue-600",    badge: "bg-blue-100 text-blue-700" },
    B: { header: "bg-emerald-500", number: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
    C: { header: "bg-amber-500",   number: "text-amber-600",   badge: "bg-amber-100 text-amber-700" },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Monitor Antrian PST</h1>
            <p className="text-xs text-gray-400">Pelayanan Statistik Terpadu</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black tabular-nums text-gray-800 tracking-tight">{clock}</div>
          <div className="text-sm text-gray-400 capitalize mt-0.5">{dateStr}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">

        {/* Currently Called — Large Display */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sedang Dipanggil</h2>
          </div>

          {calledQueues.length > 0 ? (
            <div className={`grid gap-4 flex-1 ${calledQueues.length >= 3 ? "grid-cols-3" : calledQueues.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {calledQueues.map((q) => {
                const sc = serviceColorMap[q.service?.code ?? "A"] ?? serviceColorMap["A"];
                return (
                  <div key={q.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col animate-slide-in">
                    {/* Color stripe header */}
                    <div className={`${sc.header} px-6 py-3 flex items-center justify-between`}>
                      <span className="text-white text-sm font-semibold tracking-wide">{q.service?.name}</span>
                      <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">{q.service?.code}</span>
                    </div>
                    {/* Big number */}
                    <div className="flex-1 flex flex-col items-center justify-center py-10 px-6">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Nomor Antrian</p>
                      <span className={`text-8xl lg:text-9xl font-black ${sc.number} tracking-tighter leading-none`}>
                        {q.queue_code}
                      </span>
                      <p className="text-gray-500 text-base mt-5 font-medium">{q.visitor_name}</p>
                      {q.institution && <p className="text-gray-400 text-sm">{q.institution}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center">
              <div className="text-center text-gray-400 py-16">
                <svg className="w-20 h-20 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-2xl font-bold text-gray-500">Belum Ada Antrian Dipanggil</p>
                <p className="text-gray-400 mt-2">Silakan menunggu...</p>
              </div>
            </div>
          )}
        </div>

        {/* Waiting Queue Sidebar */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Antrian Menunggu</h2>
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {waitingQueues.length}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 overflow-hidden">
            <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
              {services.map((service) => {
                const sq = waitingByService[service.id] ?? [];
                if (sq.length === 0) return null;
                const sc = serviceColorMap[service.code] ?? serviceColorMap["A"];
                return (
                  <div key={service.id}>
                    {/* Service group header */}
                    <div className={`px-4 py-2 flex items-center gap-2 ${sc.badge}`}>
                      <span className="text-xs font-bold uppercase tracking-widest">{service.name}</span>
                      <span className="ml-auto text-xs font-semibold">{sq.length} menunggu</span>
                    </div>
                    {sq.slice(0, 5).map((wq) => (
                      <div key={wq.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                        <span className={`text-xl font-black ${sc.number}`}>{wq.queue_code}</span>
                        <span className="text-sm text-gray-500 truncate ml-3">{wq.visitor_name}</span>
                      </div>
                    ))}
                    {sq.length > 5 && (
                      <div className="px-5 py-2 text-center text-xs text-gray-400">
                        +{sq.length - 5} antrian lagi
                      </div>
                    )}
                  </div>
                );
              })}

              {waitingQueues.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                  <p className="text-sm">Tidak ada antrian menunggu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live — update otomatis
        </span>
        <div className="flex space-x-4">
          <Link href="/" className="hover:text-gray-700 transition">Ambil Antrian</Link>
          <Link href="/admin" className="hover:text-gray-700 transition">Admin Panel</Link>
        </div>
      </div>
    </div>
  );
}
