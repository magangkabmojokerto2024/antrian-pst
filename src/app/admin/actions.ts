"use server";

import { createClient } from "@/lib/supabase/server";
import { getTodayWIB, getNowWIB } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function today() { return getTodayWIB(); }
function nowISO() { return new Date().toISOString(); }

export async function callNext(serviceId: number) {
  const supabase = await createClient();

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const t = today();

  // Mark currently called → served
  await supabase
    .from("queues")
    .update({ status: "served", served_at: nowISO() })
    .eq("service_id", serviceId)
    .eq("status", "called")
    .eq("date", t);

  // Find next waiting
  const { data: next } = await supabase
    .from("queues")
    .select()
    .eq("service_id", serviceId)
    .eq("status", "waiting")
    .eq("date", t)
    .order("queue_number", { ascending: true })
    .limit(1)
    .single();

  if (next) {
    await supabase
      .from("queues")
      .update({ status: "called", called_at: nowISO() })
      .eq("id", next.id);
  }

  revalidatePath("/admin");
}

export async function serveQueue(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  await supabase
    .from("queues")
    .update({ status: "served", served_at: nowISO() })
    .eq("id", id);

  revalidatePath("/admin");
}

export async function skipQueue(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  await supabase.from("queues").update({ status: "skipped" }).eq("id", id);
  revalidatePath("/admin");
}

export async function recallQueue(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  await supabase
    .from("queues")
    .update({ status: "waiting", called_at: null })
    .eq("id", id);

  revalidatePath("/admin");
}
