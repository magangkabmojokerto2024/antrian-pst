<?php

namespace App\Http\Controllers;

use App\Models\Queue;
use App\Models\QueueCounter;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Admin dashboard — show queues for a given date (default: today)
     */
    public function index(Request $request)
    {
        $services = Service::all();
        $selectedDate = $request->get('date', Carbon::today()->toDateString());
        $isToday = ($selectedDate === Carbon::today()->toDateString());

        $queues = Queue::where('date', $selectedDate)
            ->with('service')
            ->orderBy('service_id')
            ->orderBy('queue_number')
            ->get()
            ->groupBy('service_id');

        // Stats for selected date
        $baseQuery = Queue::where('date', $selectedDate);
        $stats = [
            'total' => (clone $baseQuery)->count(),
            'waiting' => (clone $baseQuery)->where('status', 'waiting')->count(),
            'called' => (clone $baseQuery)->where('status', 'called')->count(),
            'served' => (clone $baseQuery)->where('status', 'served')->count(),
            'skipped' => (clone $baseQuery)->where('status', 'skipped')->count(),
        ];

        return view('admin.index', compact('services', 'queues', 'stats', 'selectedDate', 'isToday'));
    }

    /**
     * History page — show all dates that have queue records
     */
    public function history()
    {
        $dates = Queue::selectRaw('date, COUNT(*) as total, 
                SUM(CASE WHEN status = "served" THEN 1 ELSE 0 END) as served,
                SUM(CASE WHEN status = "waiting" THEN 1 ELSE 0 END) as waiting,
                SUM(CASE WHEN status = "skipped" THEN 1 ELSE 0 END) as skipped')
            ->groupBy('date')
            ->orderByDesc('date')
            ->paginate(15);

        return view('admin.history', compact('dates'));
    }

    /**
     * Call next waiting queue for a service
     */
    public function callNext($serviceId)
    {
        // First, set any currently 'called' queue for this service to 'served'
        Queue::today()
            ->where('service_id', $serviceId)
            ->byStatus('called')
            ->update(['status' => 'served', 'served_at' => now()]);

        // Find the next waiting queue
        $next = Queue::today()
            ->where('service_id', $serviceId)
            ->byStatus('waiting')
            ->orderBy('queue_number')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'called',
                'called_at' => now(),
            ]);
            return redirect()->route('admin.index')->with('success', "Memanggil antrian {$next->queue_code}");
        }

        return redirect()->route('admin.index')->with('info', 'Tidak ada antrian menunggu untuk layanan ini.');
    }

    /**
     * Mark a queue as served
     */
    public function serve($id)
    {
        $queue = Queue::findOrFail($id);
        $queue->update([
            'status' => 'served',
            'served_at' => now(),
        ]);

        return redirect()->route('admin.index')->with('success', "Antrian {$queue->queue_code} selesai dilayani.");
    }

    /**
     * Skip a queue
     */
    public function skip($id)
    {
        $queue = Queue::findOrFail($id);
        $queue->update(['status' => 'skipped']);

        return redirect()->route('admin.index')->with('success', "Antrian {$queue->queue_code} dilewati.");
    }

    /**
     * Recall a skipped queue — put it back to waiting
     */
    public function recall($id)
    {
        $queue = Queue::findOrFail($id);
        $queue->update(['status' => 'waiting', 'called_at' => null]);

        return redirect()->route('admin.index')->with('success', "Antrian {$queue->queue_code} dikembalikan ke daftar tunggu.");
    }
}
