<?php

namespace App\Http\Controllers\Api;

use App\Exports\BookingsExport;
use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function exportBookings(Request $request)
    {
        $data = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        ActivityLogger::log(
            $request->user(),
            'report_exported',
            'Laporan',
            "Export laporan pemesanan {$data['from']} s/d {$data['to']}"
        );

        $filename = "laporan-pemesanan_{$data['from']}_{$data['to']}.xlsx";

        return Excel::download(new BookingsExport($data['from'], $data['to']), $filename);
    }
}
