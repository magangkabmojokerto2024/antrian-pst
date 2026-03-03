<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = ['code', 'name', 'description'];

    public function queues(): HasMany
    {
        return $this->hasMany(Queue::class);
    }

    public function queueCounters(): HasMany
    {
        return $this->hasMany(QueueCounter::class);
    }
}
