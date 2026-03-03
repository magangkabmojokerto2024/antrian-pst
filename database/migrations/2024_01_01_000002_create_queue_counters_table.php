<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('queue_counters', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->unsignedTinyInteger('service_id');
            $table->date('date');
            $table->unsignedSmallInteger('last_number')->default(0);
            $table->timestamps();

            $table->unique(['service_id', 'date']);
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_counters');
    }
};
