@extends('layouts.app')
@section('title', 'Admin Panel')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-slate-800">Admin Panel</h2>
            <p class="text-slate-500 text-sm">
                @if($isToday)
                    Manajemen antrian hari ini — {{ \Carbon\Carbon::parse($selectedDate)->format('d F Y') }}
                @else
                    📅 Riwayat antrian — {{ \Carbon\Carbon::parse($selectedDate)->translatedFormat('l, d F Y') }}
                @endif
            </p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
            <!-- Date Filter -->
            <form action="{{ route('admin.index') }}" method="GET" class="flex items-center gap-2">
                <input type="date" name="date" value="{{ $selectedDate }}"
                    class="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                    onchange="this.form.submit()"
                    max="{{ now()->toDateString() }}">
            </form>
            <!-- History Link -->
            <a href="{{ route('admin.history') }}" class="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-200 transition text-sm">
                📋 Riwayat
            </a>
        </div>
    </div>

    @if(!$isToday)
    <div class="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center text-sm fade-in">
        <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
        Anda sedang melihat riwayat tanggal <strong class="mx-1">{{ \Carbon\Carbon::parse($selectedDate)->format('d M Y') }}</strong>. 
        <a href="{{ route('admin.index') }}" class="ml-2 underline font-semibold hover:text-amber-900">Kembali ke hari ini →</a>
    </div>
    @endif

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        @php
            $statCards = [
                ['label' => 'Total', 'value' => $stats['total'], 'color' => 'bg-slate-100 text-slate-800', 'icon' => '📊'],
                ['label' => 'Menunggu', 'value' => $stats['waiting'], 'color' => 'bg-amber-50 text-amber-700', 'icon' => '⏳'],
                ['label' => 'Dipanggil', 'value' => $stats['called'], 'color' => 'bg-blue-50 text-blue-700', 'icon' => '📢'],
                ['label' => 'Selesai', 'value' => $stats['served'], 'color' => 'bg-green-50 text-green-700', 'icon' => '✅'],
                ['label' => 'Dilewati', 'value' => $stats['skipped'], 'color' => 'bg-red-50 text-red-700', 'icon' => '⏭️'],
            ];
        @endphp
        @foreach($statCards as $card)
        <div class="rounded-xl p-4 {{ $card['color'] }} border border-transparent">
            <div class="flex items-center justify-between">
                <span class="text-2xl">{{ $card['icon'] }}</span>
                <span class="text-2xl font-bold">{{ $card['value'] }}</span>
            </div>
            <p class="text-sm mt-1 opacity-80">{{ $card['label'] }}</p>
        </div>
        @endforeach
    </div>

    <!-- Service Panels -->
    @foreach($services as $service)
    @php
        $serviceQueues = $queues->get($service->id, collect());
        $headerColors = [
            'A' => 'from-blue-500 to-blue-600',
            'B' => 'from-emerald-500 to-emerald-600',
            'C' => 'from-amber-500 to-amber-600',
        ];
        $hc = $headerColors[$service->code] ?? 'from-primary-500 to-primary-600';
    @endphp
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Service Header -->
        <div class="bg-gradient-to-r {{ $hc }} px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <span class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white text-xl font-bold">{{ $service->code }}</span>
                <div class="text-white">
                    <h3 class="font-bold text-lg">{{ $service->name }}</h3>
                    <p class="text-sm text-white/70">{{ $serviceQueues->where('status', 'waiting')->count() }} menunggu</p>
                </div>
            </div>
            @if($isToday)
            <form action="{{ route('admin.callNext', $service->id) }}" method="POST">
                @csrf
                <button type="submit" class="px-5 py-2.5 bg-white text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm transform hover:-translate-y-0.5">
                    📢 Panggil Berikutnya
                </button>
            </form>
            @endif
        </div>

        <!-- Queue Table -->
        @if($serviceQueues->count() > 0)
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200">
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Antrian</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Instansi</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                        @if($isToday)
                        <th class="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                        @endif
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach($serviceQueues as $q)
                    @php
                        $statusBadge = [
                            'waiting' => 'bg-amber-100 text-amber-700',
                            'called' => 'bg-blue-100 text-blue-700',
                            'served' => 'bg-green-100 text-green-700',
                            'skipped' => 'bg-red-100 text-red-700',
                        ];
                        $statusLabel = [
                            'waiting' => 'Menunggu',
                            'called' => 'Dipanggil',
                            'served' => 'Selesai',
                            'skipped' => 'Dilewati',
                        ];
                    @endphp
                    <tr class="hover:bg-slate-50/50 transition {{ $q->status === 'called' ? 'bg-blue-50/50' : '' }}">
                        <td class="px-6 py-3.5">
                            <span class="font-bold text-lg text-slate-800">{{ $q->queue_code }}</span>
                        </td>
                        <td class="px-6 py-3.5 text-sm text-slate-700">{{ $q->visitor_name }}</td>
                        <td class="px-6 py-3.5 text-sm text-slate-500">{{ $q->institution ?? '-' }}</td>
                        <td class="px-6 py-3.5">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold {{ $statusBadge[$q->status] }}">
                                {{ $statusLabel[$q->status] }}
                            </span>
                        </td>
                        <td class="px-6 py-3.5 text-sm text-slate-500">
                            {{ $q->created_at->format('H:i') }}
                            @if($q->called_at)
                                <br><span class="text-xs text-blue-500">📢 {{ $q->called_at->format('H:i') }}</span>
                            @endif
                            @if($q->served_at)
                                <br><span class="text-xs text-green-500">✅ {{ $q->served_at->format('H:i') }}</span>
                            @endif
                        </td>
                        @if($isToday)
                        <td class="px-6 py-3.5 text-center">
                            <div class="flex items-center justify-center space-x-2">
                                @if($q->status === 'called')
                                <form action="{{ route('admin.serve', $q->id) }}" method="POST" class="inline">
                                    @csrf
                                    <button type="submit" class="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition border border-green-200">
                                        ✅ Selesai
                                    </button>
                                </form>
                                <form action="{{ route('admin.skip', $q->id) }}" method="POST" class="inline">
                                    @csrf
                                    <button type="submit" class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition border border-red-200">
                                        ⏭️ Skip
                                    </button>
                                </form>
                                @elseif($q->status === 'skipped')
                                <form action="{{ route('admin.recall', $q->id) }}" method="POST" class="inline">
                                    @csrf
                                    <button type="submit" class="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold hover:bg-amber-100 transition border border-amber-200">
                                        🔁 Recall
                                    </button>
                                </form>
                                @elseif($q->status === 'waiting')
                                <span class="text-xs text-slate-400">Menunggu</span>
                                @else
                                <span class="text-xs text-slate-400">—</span>
                                @endif
                            </div>
                        </td>
                        @endif
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @else
        <div class="px-6 py-8 text-center text-slate-400">
            <p class="text-sm">Belum ada antrian untuk layanan ini hari ini</p>
        </div>
        @endif
    </div>
    @endforeach
</div>
@endsection
