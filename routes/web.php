<?php

use App\Http\Controllers\QueueController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Visitor - Form & Ticket
Route::get('/', [QueueController::class , 'index'])->name('visitor.form');
Route::post('/queue', [QueueController::class , 'store'])->name('queue.store');
Route::get('/ticket/{id}', [QueueController::class , 'ticket'])->name('ticket');

// Monitor Display
Route::get('/monitor', [MonitorController::class , 'index'])->name('monitor');

// Admin Panel
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class , 'index'])->name('index');
    Route::get('/history', [AdminController::class , 'history'])->name('history');
    Route::post('/call-next/{serviceId}', [AdminController::class , 'callNext'])->name('callNext');
    Route::post('/serve/{id}', [AdminController::class , 'serve'])->name('serve');
    Route::post('/skip/{id}', [AdminController::class , 'skip'])->name('skip');
    Route::post('/recall/{id}', [AdminController::class , 'recall'])->name('recall');
});
