@extends('layouts.app')
@section('title', 'Monitor Antrian')
@section('fullscreen', true)

@section('head')
<meta http-equiv="refresh" content="5">
<style>
    @keyframes slideIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    .slide-in { animation: slideIn 0.5s ease-out forwards; }
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    .blink { animation: blink 1.5s ease-in-out infinite; }
</style>
@endsection

@section('content')
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
    <!-- Header Bar -->
    <div class="bg-black/30 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-white/10">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
            </div>
            <div>
                <h1 class="text-xl font-bold">Monitor Antrian PST</h1>
                <p class="text-xs text-slate-400">Pelayanan Statistik Terpadu</p>
            </div>
        </div>
        <div class="text-right">
            <div class="text-3xl font-bold tabular-nums" id="clock">{{ now()->format('H:i:s') }}</div>
            <div class="text-sm text-slate-400">{{ now()->format('l, d F Y') }}</div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-6 flex flex-col lg:flex-row gap-6">
        <!-- Currently Called (Large Display) -->
        <div class="lg:w-2/3 flex flex-col gap-6">
            <h2 class="text-lg font-semibold text-slate-300 uppercase tracking-wider flex items-center">
                <span class="w-3 h-3 bg-green-400 rounded-full mr-2 blink"></span>
                Sedang Dipanggil
            </h2>

            @if($calledQueues->count() > 0)
            <div class="grid grid-cols-1 md:grid-cols-{{ min($calledQueues->count(), 3) }} gap-4 flex-1">
                @foreach($calledQueues as $queue)
                @php
                    $cardColors = [
                        'A' => 'from-blue-500/20 to-blue-600/10 border-blue-400/30',
                        'B' => 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/30',
                        'C' => 'from-amber-500/20 to-amber-600/10 border-amber-400/30',
                    ];
                    $badgeColors = [
                        'A' => 'from-blue-400 to-blue-600',
                        'B' => 'from-emerald-400 to-emerald-600',
                        'C' => 'from-amber-400 to-amber-600',
                    ];
                    $cc = $cardColors[$queue->service->code] ?? $cardColors['A'];
                    $bc = $badgeColors[$queue->service->code] ?? $badgeColors['A'];
                @endphp
                <div class="bg-gradient-to-br {{ $cc }} border rounded-3xl p-8 flex flex-col items-center justify-center text-center slide-in pulse-glow">
                    <span class="text-sm font-medium text-slate-300 uppercase tracking-widest mb-2">{{ $queue->service->name }}</span>
                    <div class="my-4">
                        <span class="text-8xl lg:text-9xl font-black bg-gradient-to-r {{ $bc }} bg-clip-text text-transparent">
                            {{ $queue->queue_code }}
                        </span>
                    </div>
                    <p class="text-slate-400 text-lg">{{ $queue->visitor_name }}</p>
                </div>
                @endforeach
            </div>
            @else
            <div class="flex-1 flex items-center justify-center">
                <div class="text-center text-slate-500">
                    <svg class="w-20 h-20 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-2xl font-semibold">Belum Ada Antrian Dipanggil</p>
                    <p class="text-slate-600 mt-1">Silakan menunggu...</p>
                </div>
            </div>
            @endif
        </div>

        <!-- Waiting Queue Sidebar -->
        <div class="lg:w-1/3 flex flex-col">
            <h2 class="text-lg font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.414L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
                Antrian Menunggu
            </h2>

            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex-1 overflow-hidden">
                <div class="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
                    @php $hasWaiting = false; @endphp
                    @foreach($services as $id => $service)
                        @if(isset($waitingQueues[$id]) && $waitingQueues[$id]->count() > 0)
                            @php $hasWaiting = true; @endphp
                            @foreach($waitingQueues[$id]->take(5) as $wq)
                            <div class="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition">
                                @php
                                    $textColor = ['A' => 'text-blue-400', 'B' => 'text-emerald-400', 'C' => 'text-amber-400'];
                                    $tc = $textColor[$service->code] ?? 'text-slate-400';
                                @endphp
                                <div class="flex items-center space-x-3">
                                    <span class="text-xl font-bold {{ $tc }}">{{ $wq->queue_code }}</span>
                                </div>
                                <span class="text-sm text-slate-500">{{ $wq->visitor_name }}</span>
                            </div>
                            @endforeach
                            @if($waitingQueues[$id]->count() > 5)
                            <div class="px-5 py-2 text-center text-xs text-slate-500">
                                +{{ $waitingQueues[$id]->count() - 5 }} antrian lagi
                            </div>
                            @endif
                        @endif
                    @endforeach

                    @if(!$hasWaiting)
                    <div class="p-8 text-center text-slate-500">
                        <p class="text-sm">Tidak ada antrian menunggu</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="bg-black/20 border-t border-white/10 px-6 py-3 flex justify-between items-center text-sm text-slate-500">
        <span>Auto-refresh setiap 5 detik</span>
        <div class="flex space-x-4">
            <a href="{{ route('visitor.form') }}" class="hover:text-white transition">Ambil Antrian</a>
            <a href="{{ route('admin.index') }}" class="hover:text-white transition">Admin Panel</a>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script>
    // Live clock
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('clock').textContent = h + ':' + m + ':' + s;
    }
    setInterval(updateClock, 1000);
</script>
@endsection
