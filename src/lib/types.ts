export interface Service {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type QueueStatus = "waiting" | "called" | "served" | "skipped";

export interface Queue {
  id: number;
  service_id: number;
  visitor_name: string;
  institution: string | null;
  queue_number: number;
  queue_code: string;
  status: QueueStatus;
  date: string;
  called_at: string | null;
  served_at: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface QueueStats {
  total: number;
  waiting: number;
  called: number;
  served: number;
  skipped: number;
}

export interface HistoryRecord {
  date: string;
  total: number;
  served: number;
  waiting: number;
  skipped: number;
}

// Helper: get today's date in WIB (UTC+7) as YYYY-MM-DD
export function getTodayWIB(): string {
  const now = new Date();
  const wibMs = now.getTime() + (7 * 60 - now.getTimezoneOffset()) * 60000;
  return new Date(wibMs).toISOString().split("T")[0];
}

// Helper: get current datetime string in WIB
export function getNowWIB(): string {
  const now = new Date();
  const wibMs = now.getTime() + (7 * 60 - now.getTimezoneOffset()) * 60000;
  return new Date(wibMs).toISOString().replace("Z", "+07:00");
}

export const SERVICE_COLORS: Record<string, { bg: string; badge: string; text: string; gradient: string; card: string }> = {
  A: {
    bg:       "bg-blue-50 hover:bg-blue-100",
    badge:    "bg-blue-500",
    text:     "text-blue-400",
    gradient: "from-blue-500 to-blue-600",
    card:     "from-blue-500/20 to-blue-600/10 border-blue-400/30",
  },
  B: {
    bg:       "bg-emerald-50 hover:bg-emerald-100",
    badge:    "bg-emerald-500",
    text:     "text-emerald-400",
    gradient: "from-emerald-500 to-emerald-600",
    card:     "from-emerald-500/20 to-emerald-600/10 border-emerald-400/30",
  },
  C: {
    bg:       "bg-amber-50 hover:bg-amber-100",
    badge:    "bg-amber-500",
    text:     "text-amber-400",
    gradient: "from-amber-500 to-amber-600",
    card:     "from-amber-500/20 to-amber-600/10 border-amber-400/30",
  },
};

export const STATUS_LABEL: Record<string, string> = {
  waiting: "Menunggu",
  called:  "Dipanggil",
  served:  "Selesai",
  skipped: "Dilewati",
};

export const STATUS_BADGE: Record<string, string> = {
  waiting: "bg-amber-100 text-amber-700",
  called:  "bg-blue-100 text-blue-700",
  served:  "bg-green-100 text-green-700",
  skipped: "bg-red-100 text-red-700",
};
