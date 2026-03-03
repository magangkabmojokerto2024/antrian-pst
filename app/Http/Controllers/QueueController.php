<?php

namespace App\Http\Controllers;

use App\Models\Queue;
use App\Models\QueueCounter;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;

class QueueController extends Controller
{
    /**
     * Show visitor form
     */
    public function index()
    {
        $services = Service::all();
        return view('visitor.form', compact('services'));
    }

    /**
     * Store new queue entry
     */
    public function store(Request $request)
    {
        $request->validate([
            'visitor_name' => 'required|string|max:150',
            'institution' => 'nullable|string|max:150',
            'service_id' => 'required|exists:services,id',
        ]);

        $service = Service::findOrFail($request->service_id);
        $today = Carbon::today()->toDateString();

        // Get next number atomically
        $number = QueueCounter::nextNumber($service->id);
        $queueCode = $service->code . '-' . $number;

        $queue = Queue::create([
            'service_id' => $service->id,
            'visitor_name' => $request->visitor_name,
            'institution' => $request->institution,
            'queue_number' => $number,
            'queue_code' => $queueCode,
            'status' => 'waiting',
            'date' => $today,
        ]);

        return redirect()->route('ticket', $queue->id);
    }

    /**
     * Show ticket confirmation
     */
    public function ticket($id)
    {
        $queue = Queue::with('service')->findOrFail($id);
        $waitingBefore = Queue::today()
            ->where('service_id', $queue->service_id)
            ->byStatus('waiting')
            ->where('queue_number', '<', $queue->queue_number)
            ->count();

        return view('visitor.ticket', compact('queue', 'waitingBefore'));
    }
}
