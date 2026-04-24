import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Antrian PST Kabupaten Mojokerto</h1>
                <p className="text-xs text-slate-500 -mt-0.5">Pelayanan Statistik Terpadu</p>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex items-center space-x-1">
              <Link href="/" className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200">
                <span className="hidden sm:inline">📝</span> Ambil Antrian
              </Link>
              <Link href="/monitor" className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200">
                <span className="hidden sm:inline">📺</span> Monitor
              </Link>
              <Link href="/admin" className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-50 text-primary-700 transition-all duration-200">
                <span className="hidden sm:inline">⚙️</span> Admin
              </Link>

              {/* User + Logout */}
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
                <span className="text-xs text-slate-500 hidden sm:block">{user.email}</span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} — Sistem Antrian PST (Pelayanan Statistik Terpadu)
      </footer>
    </>
  );
}
