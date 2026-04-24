import { createClient } from "@/lib/supabase/server";
import { getTodayWIB } from "@/lib/types";
import MonitorDisplay from "./MonitorDisplay";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitor Antrian — PST",
  description: "Layar display antrian PST yang sedang dipanggil",
};

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  const supabase = await createClient();
  const today = getTodayWIB();

  const { data: calledQueues } = await supabase
    .from("queues")
    .select("*, service:services(*)")
    .eq("date", today)
    .eq("status", "called")
    .order("called_at", { ascending: false });

  const { data: waitingQueues } = await supabase
    .from("queues")
    .select("*, service:services(*)")
    .eq("date", today)
    .eq("status", "waiting")
    .order("queue_number", { ascending: true });

  const { data: services } = await supabase
    .from("services")
    .select()
    .order("code");

  return (
    <MonitorDisplay
      initialCalledQueues={calledQueues ?? []}
      initialWaitingQueues={waitingQueues ?? []}
      services={services ?? []}
    />
  );
}
