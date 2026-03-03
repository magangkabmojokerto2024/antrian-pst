@extends('layouts.app')
@section('title', 'Ambil Antrian')

@section('content')
<div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8 slide-up">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-800">Ambil Nomor Antrian</h2>
        <p class="text-slate-500 mt-1">Silakan isi data dan pilih layanan yang dibutuhkan</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 slide-up" style="animation-delay: 0.1s">
        <form action="{{ route('queue.store') }}" method="POST">
            @csrf

            <!-- Nama -->
            <div class="mb-6">
                <label for="visitor_name" class="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Lengkap <span class="text-red-400">*</span>
                </label>
                <input type="text" name="visitor_name" id="visitor_name" required
                    value="{{ old('visitor_name') }}"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none text-slate-700 placeholder-slate-400"
                    placeholder="Masukkan nama lengkap Anda">
                @error('visitor_name')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Instansi -->
            <div class="mb-6">
                <label for="institution" class="block text-sm font-semibold text-slate-700 mb-2">
                    Instansi / Lembaga
                </label>
                <input type="text" name="institution" id="institution"
                    value="{{ old('institution') }}"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none text-slate-700 placeholder-slate-400"
                    placeholder="Nama instansi / lembaga (opsional)">
            </div>

            <!-- Pilih Layanan -->
            <div class="mb-8">
                <label class="block text-sm font-semibold text-slate-700 mb-3">
                    Pilih Layanan <span class="text-red-400">*</span>
                </label>
                <div class="grid gap-3">
                    @foreach($services as $service)
                    @php
                        $colors = [
                            'A' => ['bg' => 'bg-blue-50 hover:bg-blue-100 peer-checked:bg-blue-100 peer-checked:border-blue-500', 'badge' => 'bg-blue-500', 'ring' => 'peer-checked:ring-blue-200'],
                            'B' => ['bg' => 'bg-emerald-50 hover:bg-emerald-100 peer-checked:bg-emerald-100 peer-checked:border-emerald-500', 'badge' => 'bg-emerald-500', 'ring' => 'peer-checked:ring-emerald-200'],
                            'C' => ['bg' => 'bg-amber-50 hover:bg-amber-100 peer-checked:bg-amber-100 peer-checked:border-amber-500', 'badge' => 'bg-amber-500', 'ring' => 'peer-checked:ring-amber-200'],
                        ];
                        $c = $colors[$service->code] ?? $colors['A'];
                    @endphp
                    <label class="relative cursor-pointer">
                        <input type="radio" name="service_id" value="{{ $service->id }}" class="peer sr-only" {{ old('service_id') == $service->id ? 'checked' : '' }} required>
                        <div class="flex items-center p-4 rounded-xl border-2 border-slate-200 transition-all duration-200 {{ $c['bg'] }} {{ $c['ring'] }} peer-checked:ring-2">
                            <div class="w-10 h-10 {{ $c['badge'] }} rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                                {{ $service->code }}
                            </div>
                            <div>
                                <p class="font-semibold text-slate-800">{{ $service->name }}</p>
                                <p class="text-sm text-slate-500">{{ $service->description }}</p>
                            </div>
                            <div class="ml-auto">
                                <div class="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-0 flex items-center justify-center transition-all">
                                </div>
                            </div>
                        </div>
                    </label>
                    @endforeach
                </div>
                @error('service_id')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Submit -->
            <button type="submit"
                class="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
                Ambil Nomor Antrian →
            </button>
        </form>
    </div>
</div>
@endsection
