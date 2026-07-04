<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FuelLog;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private const MONTH_LABELS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
        7 => 'Jul', 8 => 'Ags', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
    ];

    public function index()
    {
        return response()->json([
            'data' => [
                'usagePerMonth' => $this->usagePerMonth(),
                'usagePerRegion' => $this->usagePerRegion(),
                'fuelTrend' => $this->fuelTrend(),
            ],
        ]);
    }

    // Number of bookings (trips) started per month, over the last 6 months.
    private function usagePerMonth(): array
    {
        return $this->lastSixMonths(function (Carbon $month) {
            return Booking::whereYear('start_date', $month->year)
                ->whereMonth('start_date', $month->month)
                ->count();
        }, 'trips');
    }

    // Number of bookings per region, most recent 6 months combined.
    private function usagePerRegion(): array
    {
        $since = now()->subMonths(6)->startOfMonth();

        $rows = Booking::join('regions', 'regions.id', '=', 'bookings.region_id')
            ->where('bookings.start_date', '>=', $since)
            ->select('regions.name as region', DB::raw('count(*) as trips'))
            ->groupBy('regions.name')
            ->orderByDesc('trips')
            ->get();

        return $rows->map(fn ($r) => ['region' => $r->region, 'trips' => (int) $r->trips])->all();
    }

    // Total liters filled per month, over the last 6 months.
    private function fuelTrend(): array
    {
        return $this->lastSixMonths(function (Carbon $month) {
            return (int) FuelLog::whereYear('filled_at', $month->year)
                ->whereMonth('filled_at', $month->month)
                ->sum('liters');
        }, 'liter');
    }

    private function lastSixMonths(callable $valueFor, string $key): array
    {
        $result = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $result[] = [
                'month' => self::MONTH_LABELS[$month->month],
                $key => $valueFor($month),
            ];
        }

        return $result;
    }
}
