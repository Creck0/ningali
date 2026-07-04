<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private BookingService $bookings)
    {
    }

    public function index(Request $request)
    {
        $query = Booking::with(['vehicle', 'driver', 'requester', 'region', 'approvals.approver'])
            ->orderByDesc('id');

        // Approvers only need to see bookings currently awaiting their level in the
        // "My Approvals" screen; the frontend also does this filter client-side,
        // but we scope it server-side too so the API is safe to use directly.
        if ($request->boolean('mine') && $request->user()->role === 'approver') {
            $level = $request->user()->approval_level;
            $status = $level === 1 ? 'pending_l1' : 'pending_l2';
            $query->where('status', $status);
        }

        return response()->json(['data' => $query->get()->map(fn ($b) => $this->format($b))]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle' => 'required|string',
            'driver' => 'required|string',
            'purpose' => 'required|string',
            'region' => 'required|string',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after_or_equal:startDate',
            'odometerStart' => 'nullable|numeric',
            'approverL1' => 'required|string',
            'approverL2' => 'required|string',
        ]);

        $booking = $this->bookings->create($data, $request->user());

        return response()->json(['data' => $this->format($booking)], 201);
    }

    public function decide(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'decision' => 'required|in:approved,rejected',
            'note' => 'nullable|string',
        ]);

        $booking = $this->bookings->decide($booking, $request->user(), $data['decision'], $data['note'] ?? null);

        return response()->json(['data' => $this->format($booking)]);
    }

    public function complete(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'odometerEnd' => 'required|numeric',
            'liters' => 'nullable|numeric',
            'cost' => 'nullable|numeric',
        ]);

        $booking = $this->bookings->complete($booking, $request->user(), $data);

        return response()->json(['data' => $this->format($booking)]);
    }

    private function format(Booking $b): array
    {
        return [
            'id' => $b->id,
            'bookingNo' => $b->booking_no,
            'vehicle' => $b->vehicle->label,
            'driver' => $b->driver->name,
            'requester' => $b->requester->name,
            'purpose' => $b->purpose,
            'region' => $b->region?->name,
            'startDate' => $b->start_date->format('Y-m-d'),
            'endDate' => $b->end_date->format('Y-m-d'),
            'status' => $b->status,
            'odometerStart' => $b->odometer_start,
            'odometerEnd' => $b->odometer_end,
            'approvals' => $b->approvals->map(fn ($a) => [
                'level' => $a->level,
                'name' => $a->approver->name,
                'status' => $a->status,
                'note' => $a->note,
            ]),
        ];
    }
}
