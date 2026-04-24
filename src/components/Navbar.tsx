"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  showAdminLink?: boolean;
}

export default function Navbar({ showAdminLink = true }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (prefix: string) => pathname.startsWith(prefix);
  const linkClass = (prefix: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive(prefix)
        ? "bg-primary-50 text-primary-700"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
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
              <h1 className="text-lg font-bold text-slate-800">Antrian PST</h1>
              <p className="text-xs text-slate-500 -mt-0.5">Pelayanan Statistik Terpadu</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-1">
            <Link href="/" className={linkClass("/ticket") || pathname === "/" ? (pathname === "/" || pathname.startsWith("/ticket") ? "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-primary-50 text-primary-700" : "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-600 hover:bg-slate-100") : "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-600 hover:bg-slate-100"}>
              <span className="hidden sm:inline">📝</span> Ambil Antrian
            </Link>
            <Link href="/monitor" className={linkClass("/monitor")}>
              <span className="hidden sm:inline">📺</span> Monitor
            </Link>
            {showAdminLink && (
              <Link href="/admin" className={linkClass("/admin")}>
                <span className="hidden sm:inline">⚙️</span> Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
