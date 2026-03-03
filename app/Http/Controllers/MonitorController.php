<?php

namespace App\Http\Controllers;

use App\Models\Queue;
use App\Models\Service;

class MonitorController extends Controller
{
    public function index()
    {
        // Currently called queues (one per service)
        $calledQueues = Queue::currentlyCalled();

        // Waiting queues grouped by service
        $waitingQueues = Queue::today()
            ->byStatus('waiting')
            ->with('service')
            ->orderBy('queue_number')
            ->get()
            ->groupBy('service_id');

        $services = Service::all()->keyBy('id');

        return view('monitor.index', compact('calledQueues', 'waitingQueues', 'services'));
    }
}
