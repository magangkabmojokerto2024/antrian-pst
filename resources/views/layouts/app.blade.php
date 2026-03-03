<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Antrian PST') — Pelayanan Statistik Terpadu</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        primary: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' },
                        accent: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d' },
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
    </style>
    @yield('head')
</head>
<body class="bg-slate-50 min-h-screen">
    @hasSection('fullscreen')
        @yield('content')
    @else
    <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-slate-800">Antrian PST</h1>
                        <p class="text-xs text-slate-500 -mt-0.5">Pelayanan Statistik Terpadu</p>
                    </div>
                </div>
                <div class="flex items-center space-x-1">
                    <a href="{{ route('visitor.form') }}" class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 {{ request()->routeIs('visitor.*') || request()->routeIs('ticket') ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100' }}">
                        <span class="hidden sm:inline">📝</span> Ambil Antrian
                    </a>
                    <a href="{{ route('monitor') }}" class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 {{ request()->routeIs('monitor') ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100' }}">
                        <span class="hidden sm:inline">📺</span> Monitor
                    </a>
                    <a href="{{ route('admin.index') }}" class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 {{ request()->routeIs('admin.*') ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100' }}">
                        <span class="hidden sm:inline">⚙️</span> Admin
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {{-- Flash messages --}}
        @if(session('success'))
        <div class="mb-6 bg-accent-50 border border-accent-200 text-accent-800 px-4 py-3 rounded-xl flex items-center fade-in">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            {{ session('success') }}
        </div>
        @endif
        @if(session('info'))
        <div class="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex items-center fade-in">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
            {{ session('info') }}
        </div>
        @endif

        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
        &copy; {{ date('Y') }} — Sistem Antrian PST (Pelayanan Statistik Terpadu)
    </footer>
    @endif

    @yield('scripts')
</body>
</html>
