<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Region;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /**
     * Create a booking and its two pending approval steps.
     * Status starts at pending_l1, per the activity diagram in the README.
     */
    public function create(array $data, User $admin): Booking
    {
        $vehicle = $this->resolveVehicle($data['vehicle']);
        $driver = Driver::firstOrCreate(['name' => $data['driver']]);
        $region = Region::where('name', $data['region'])->first();
        $approverL1 = $this->resolveApprover($data['approverL1'], 1);
        $approverL2 = $this->resolveApprover($data['approverL2'], 2);

        return DB::transaction(function () use ($data, $admin, $vehicle, $driver, $region, $approverL1, $approverL2) {
            $bookingNo = $this->nextBookingNo();

            $booking = Booking::create([
                'booking_no' => $bookingNo,
                'vehicle_id' => $vehicle->id,
                'driver_id' => $driver->id,
                'requested_by' => $admin->id,
                'purpose' => $data['purpose'],
                'region_id' => $region?->id,
                'start_date' => $data['startDate'],
                'end_date' => $data['endDate'],
                'status' => 'pending_l1',
                'odometer_start' => isset($data['odometerStart']) && $data['odometerStart'] !== ''
                    ? (int) $data['odometerStart']
                    : null,
            ]);

            $booking->approvals()->create(['approver_id' => $approverL1->id, 'level' => 1, 'status' => 'pending']);
            $booking->approvals()->create(['approver_id' => $approverL2->id, 'level' => 2, 'status' => 'pending']);

            ActivityLogger::log($admin, 'booking_created', 'Pemesanan', "Membuat pemesanan {$bookingNo}");

            return $booking->fresh(['vehicle', 'driver', 'requester', 'region', 'approvals.approver']);
        });
    }

    /**
     * Record an approve/reject decision for whichever level is currently pending.
     * Approving level 1 moves the booking to pending_l2; approving level 2 marks it
     * approved and hands the vehicle over (status -> in_use).
     */
    public function decide(Booking $booking, User $approver, string $decision, ?string $note = null): Booking
    {
        $level = $booking->currentLevel();

        if ($level === null) {
            throw ValidationException::withMessages(['status' => 'Pemesanan ini sudah tidak menunggu persetujuan.']);
        }

        $approval = $booking->approvals()->where('level', $level)->first();

        if (! $approval || $approval->approver_id !== $approver->id) {
            throw ValidationException::withMessages(['approver' => 'Anda bukan approver untuk level ini.']);
        }

        return DB::transaction(function () use ($booking, $approver, $decision, $note, $level, $approval) {
            $approval->update([
                'status' => $decision,
                'note' => $note,
                'decided_at' => now(),
            ]);

            if ($decision === 'rejected') {
                $booking->update(['status' => 'rejected']);
            } elseif ($level === 1) {
                $booking->update(['status' => 'pending_l2']);
            } else {
                $booking->update(['status' => 'approved']);
                $booking->vehicle()->update(['status' => 'in_use']);
                ActivityLogger::log(
                    $approver,
                    'vehicle_updated',
                    'Kendaraan',
                    "Update status {$booking->vehicle->code} menjadi in_use ({$booking->booking_no} disetujui penuh)"
                );
            }

            $verb = $decision === 'rejected' ? 'Menolak' : 'Menyetujui';
            ActivityLogger::log(
                $approver,
                ($decision === 'rejected' ? 'rejected_l' : 'approved_l') . $level,
                'Approval',
                "{$verb} {$booking->booking_no} (Level {$level})"
            );

            return $booking->fresh(['vehicle', 'driver', 'requester', 'region', 'approvals.approver']);
        });
    }

    /**
     * Mark a fully-approved booking as completed: log the final odometer,
     * optionally record a closing fuel fill-up, and return the vehicle to the pool.
     */
    public function complete(Booking $booking, User $actor, array $data): Booking
    {
        if ($booking->status !== 'approved') {
            throw ValidationException::withMessages(['status' => 'Hanya pemesanan berstatus "Disetujui" yang dapat diselesaikan.']);
        }

        return DB::transaction(function () use ($booking, $actor, $data) {
            $odometerEnd = (int) $data['odometerEnd'];

            $booking->update([
                'status' => 'completed',
                'odometer_end' => $odometerEnd,
            ]);

            $booking->vehicle()->update(['status' => 'available']);

            if (! empty($data['liters'])) {
                FuelLog::create([
                    'vehicle_id' => $booking->vehicle_id,
                    'booking_id' => $booking->id,
                    'liters' => (int) $data['liters'],
                    'cost' => (int) ($data['cost'] ?? 0),
                    'odometer' => $odometerEnd,
                    'filled_at' => now()->toDateString(),
                ]);
                ActivityLogger::log(
                    $actor,
                    'fuel_log_added',
                    'Kendaraan',
                    "Catat pengisian BBM {$data['liters']}L untuk {$booking->vehicle->label}"
                );
            }

            ActivityLogger::log(
                $actor,
                'booking_completed',
                'Pemesanan',
                "Menyelesaikan pemesanan {$booking->booking_no} — odometer akhir " . number_format($odometerEnd, 0, ',', '.') . ' km'
            );

            return $booking->fresh(['vehicle', 'driver', 'requester', 'region', 'approvals.approver']);
        });
    }

    private function resolveVehicle(string $label): Vehicle
    {
        // Frontend sends "VH-001 · DR 1234 EA" — the code is the part before " · ".
        $code = trim(explode('·', $label)[0]);
        $vehicle = Vehicle::where('code', $code)->first();

        if (! $vehicle) {
            throw ValidationException::withMessages(['vehicle' => "Kendaraan '{$label}' tidak ditemukan."]);
        }

        return $vehicle;
    }

    private function resolveApprover(string $name, int $level): User
    {
        $approver = User::where('role', 'approver')->where('approval_level', $level)->where('name', $name)->first();

        if (! $approver) {
            throw ValidationException::withMessages(["approverL{$level}" => "Approver level {$level} '{$name}' tidak ditemukan."]);
        }

        return $approver;
    }

    private function nextBookingNo(): string
    {
        $prefix = 'BK-' . now()->format('ym') . '-';
        $countThisMonth = Booking::where('booking_no', 'like', $prefix . '%')->count();

        return $prefix . str_pad((string) ($countThisMonth + 1), 3, '0', STR_PAD_LEFT);
    }
}
