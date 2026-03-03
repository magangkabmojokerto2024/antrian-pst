<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $services = [
            ['code' => 'A', 'name' => 'Konsultasi Statistik', 'description' => 'Konsultasi terkait data dan statistik', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'B', 'name' => 'Permintaan Data', 'description' => 'Permintaan data mikro/makro', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'C', 'name' => 'Layanan Lainnya', 'description' => 'Layanan PST lainnya', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($services as $service) {
            DB::table('services')->updateOrInsert(
                ['code' => $service['code']],
                $service
            );
        }
    }

    public function down(): void
    {
        DB::table('services')->whereIn('code', ['A', 'B', 'C'])->delete();
    }
};
