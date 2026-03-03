<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('queues', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('service_id');
            $table->string('visitor_name', 150);
            $table->string('institution', 150)->nullable();
            $table->unsignedSmallInteger('queue_number');
            $table->string('queue_code', 10); // e.g. A-1, B-3
            $table->enum('status', ['waiting', 'called', 'served', 'skipped'])->default('waiting');
            $table->date('date');
            $table->timestamp('called_at')->nullable();
            $table->timestamp('served_at')->nullable();
            $table->timestamps();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->index(['date', 'service_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queues');
    }
};
