<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class QueueCounter extends Model
{
    protected $fillable = ['service_id', 'date', 'last_number'];

    protected $casts = [
        'date' => 'date',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get next queue number for a service today.
     * Uses atomic DB operation to prevent race conditions.
     */
    public static function nextNumber(int $serviceId): int
    {
        $today = Carbon::today()->toDateString();

        // Atomic increment: insert or update
        $counter = DB::transaction(function () use ($serviceId, $today) {
            $counter = self::lockForUpdate()
                ->where('service_id', $serviceId)
                ->where('date', $today)
                ->first();

            if ($counter) {
                $counter->increment('last_number');
                $counter->refresh();
            }
            else {
                $counter = self::create([
                    'service_id' => $serviceId,
                    'date' => $today,
                    'last_number' => 1,
                ]);
            }

            return $counter;
        });

        return $counter->last_number;
    }
}
