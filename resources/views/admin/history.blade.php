@extends('layouts.app')
@section('title', 'Riwayat Antrian')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-slate-800">📋 Riwayat Antrian</h2>
            <p class="text-slate-500 text-sm">Daftar semua tanggal yang memiliki catatan antrian</p>
        </div>
        <a href="{{ route('admin.index') }}" class="px-4 py-2.5 bg-primary-50 text-primary-700 font-semibold rounded-xl border border-primary-200 hover:bg-primary-100 transition text-sm">
            ← Kembali ke Hari Ini
        </a>
    </div>

    <!-- History Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full">
            <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                    <th class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Dilewati</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse($dates as $record)
                @php
                    $dateObj = \Carbon\Carbon::parse($record->date);
                    $isToday = $dateObj->isToday();
                @endphp
                <tr class="hover:bg-slate-50/50 transition {{ $isToday ? 'bg-primary-50/30' : '' }}">
                    <td class="px-6 py-4">
                        <div>
                            <span class="font-semibold text-slate-800">{{ $dateObj->translatedFormat('l') }}</span>
                            @if($isToday)
                                <span class="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-md text-xs font-semibold">Hari ini</span>
                            @endif
                            <p class="text-sm text-slate-500">{{ $dateObj->format('d F Y') }}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="text-lg font-bold text-slate-800">{{ $record->total }}</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                            ✅ {{ $record->served }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
                            ⏳ {{ $record->waiting }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                            ⏭️ {{ $record->skipped }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <a href="{{ route('admin.index', ['date' => $record->date]) }}"
                           class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                            👁️ Lihat Detail
                        </a>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                        <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p class="text-sm">Belum ada riwayat antrian</p>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    @if($dates->hasPages())
    <div class="flex justify-center">
        {{ $dates->links() }}
    </div>
    @endif
</div>
@endsection
