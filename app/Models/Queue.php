<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Queue extends Model
{
    protected $fillable = [
        'service_id', 'visitor_name', 'institution',
        'queue_number', 'queue_code', 'status', 'date',
        'called_at', 'served_at',
    ];

    protected $casts = [
        'date' => 'date',
        'called_at' => 'datetime',
        'served_at' => 'datetime',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    // Scope: only today
    public function scopeToday(Builder $query): Builder
    {
        return $query->where('date', Carbon::today()->toDateString());
    }

    // Scope: by status
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    // Get the currently called queue (latest per service)
    public static function currentlyCalled()
    {
        return self::today()
            ->byStatus('called')
            ->with('service')
            ->orderBy('called_at', 'desc')
            ->get()
            ->unique('service_id');
    }
}
