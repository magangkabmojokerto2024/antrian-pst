<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['code' => 'A', 'name' => 'Konsultasi Statistik', 'description' => 'Konsultasi mengenai data dan metodologi statistik'],
            ['code' => 'B', 'name' => 'Permintaan Data', 'description' => 'Permintaan data mikro/makro dan publikasi statistik'],
            ['code' => 'C', 'name' => 'Layanan Lainnya', 'description' => 'Rekomendasi kegiatan statistik dan layanan lainnya'],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(['code' => $service['code']], $service);
        }
    }
}
