import { createClient } from "@/lib/supabase/server";
import { getTodayWIB, SERVICE_COLORS } from "@/lib/types";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

async function createQueueAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const today = getTodayWIB();

  const serviceId = parseInt(formData.get("service_id") as string);
  const visitorName = (formData.get("visitor_name") as string)?.trim();
  const institution  = (formData.get("institution") as string)?.trim() || null;

  if (!serviceId || !visitorName) return;

  // Get service
  const { data: service } = await supabase
    .from("services")
    .select()
    .eq("id", serviceId)
    .single();

  if (!service) return;

  const { data: queueNumber, error: rpcError } = await supabase.rpc("get_next_queue_number", {
    p_service_id: serviceId,
    p_date: today,
  });

  if (rpcError || !queueNumber) {
    console.error("Failed to get next queue number:", rpcError);
    return;
  }

  const queueCode = `${service.code}-${queueNumber}`;

  const { data: queue, error } = await supabase
    .from("queues")
    .insert({
      service_id:    serviceId,
      visitor_name:  visitorName,
      institution,
      queue_number:  queueNumber as number,
      queue_code:    queueCode,
      status:        "waiting",
      date:          today,
    })
    .select()
    .single();

  if (error || !queue) return;

  redirect(`/ticket/${queue.id}`);
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select().order("code");

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Ambil Nomor Antrian</h2>
            <p className="text-slate-500 mt-1">Silakan isi data dan pilih layanan yang dibutuhkan</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <form action={createQueueAction}>
              {/* Nama */}
              <div className="mb-6">
                <label htmlFor="visitor_name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="visitor_name"
                  id="visitor_name"
                  required
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none text-slate-700 placeholder-slate-400"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              {/* Instansi */}
              <div className="mb-6">
                <label htmlFor="institution" className="block text-sm font-semibold text-slate-700 mb-2">
                  Instansi / Lembaga
                </label>
                <input
                  type="text"
                  name="institution"
                  id="institution"
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none text-slate-700 placeholder-slate-400"
                  placeholder="Nama instansi / lembaga (opsional)"
                />
              </div>

              {/* Pilih Layanan */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Pilih Layanan <span className="text-red-400">*</span>
                </label>
                <div className="grid gap-3">
                  {(services ?? []).map((service) => {
                    const c = SERVICE_COLORS[service.code] ?? SERVICE_COLORS["A"];
                    return (
                      <label key={service.id} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="service_id"
                          value={service.id}
                          className="peer sr-only"
                          required
                        />
                        <div className={`flex items-center p-4 rounded-xl border-2 border-slate-200 transition-all duration-200 ${c.bg} peer-checked:border-primary-500 peer-checked:ring-2 peer-checked:ring-primary-200`}>
                          <div className={`w-10 h-10 ${c.badge} rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0`}>
                            {service.code}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{service.name}</p>
                            <p className="text-sm text-slate-500">{service.description}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Ambil Nomor Antrian →
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} — Sistem Antrian PST (Pelayanan Statistik Terpadu)
      </footer>
    </>
  );
}
