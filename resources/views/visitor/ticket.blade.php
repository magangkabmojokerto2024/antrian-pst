@extends('layouts.app')
@section('title', 'Tiket Antrian')

@section('content')
<div class="max-w-lg mx-auto text-center">
    <!-- Ticket Card -->
    <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden slide-up">
        <!-- Gradient Header -->
        @php
            $headerColors = [
                'A' => 'from-blue-500 to-blue-700',
                'B' => 'from-emerald-500 to-emerald-700',
                'C' => 'from-amber-500 to-amber-600',
            ];
            $hc = $headerColors[$queue->service->code] ?? 'from-primary-500 to-primary-700';
        @endphp
        <div class="bg-gradient-to-br {{ $hc }} px-6 py-8 text-white">
            <p class="text-sm font-medium opacity-80 uppercase tracking-wider">Nomor Antrian Anda</p>
            <div class="mt-4 mb-2">
                <span class="text-7xl sm:text-8xl font-black tracking-tight pulse-glow inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4">
                    {{ $queue->queue_code }}
                </span>
            </div>
            <p class="text-white/80 text-sm mt-4">{{ $queue->service->name }}</p>
        </div>

        <!-- Ticket Body -->
        <div class="px-6 py-6">
            <!-- Dashed Separator -->
            <div class="border-t-2 border-dashed border-slate-200 mb-6 -mx-6"></div>

            <div class="space-y-3 text-left">
                <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-slate-500">Nama</span>
                    <span class="text-sm font-semibold text-slate-800">{{ $queue->visitor_name }}</span>
                </div>
                @if($queue->institution)
                <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-slate-500">Instansi</span>
                    <span class="text-sm font-semibold text-slate-800">{{ $queue->institution }}</span>
                </div>
                @endif
                <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-slate-500">Layanan</span>
                    <span class="text-sm font-semibold text-slate-800">{{ $queue->service->code }} — {{ $queue->service->name }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-slate-500">Tanggal</span>
                    <span class="text-sm font-semibold text-slate-800">{{ $queue->date->format('d M Y') }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-slate-500">Waktu Ambil</span>
                    <span class="text-sm font-semibold text-slate-800">{{ $queue->created_at->format('H:i') }} WIB</span>
                </div>
            </div>

            <!-- Waiting Info -->
            <div class="mt-6 bg-slate-50 rounded-xl p-4">
                <div class="flex items-center justify-center space-x-2">
                    <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.414L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-sm text-slate-600">
                        @if($waitingBefore > 0)
                            <strong class="text-slate-800">{{ $waitingBefore }} orang</strong> menunggu sebelum Anda
                        @else
                            Anda antrian <strong class="text-accent-600">berikutnya!</strong>
                        @endif
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex flex-col sm:flex-row gap-3 slide-up" style="animation-delay: 0.2s">
        <a href="{{ route('visitor.form') }}"
            class="flex-1 py-3 px-6 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-center">
            ← Ambil Antrian Lagi
        </a>
        <a href="{{ route('monitor') }}"
            class="flex-1 py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl transition text-center">
            Lihat Monitor →
        </a>
    </div>
</div>
@endsection
