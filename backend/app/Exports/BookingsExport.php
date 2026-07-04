<?php

namespace App\Exports;

use App\Models\Booking;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BookingsExport implements FromCollection, WithHeadings, WithMapping, WithColumnWidths, WithStyles
{
    private const STATUS_LABEL = [
        'pending_l1' => 'Menunggu Approval L1',
        'pending_l2' => 'Menunggu Approval L2',
        'approved' => 'Disetujui',
        'rejected' => 'Ditolak',
        'completed' => 'Selesai',
    ];

    public function __construct(private string $from, private string $to)
    {
    }

    public function collection(): Collection
    {
        return Booking::with(['vehicle', 'driver', 'requester', 'region'])
            ->whereBetween('start_date', [$this->from, $this->to])
            ->orderBy('start_date')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No Pemesanan', 'Kendaraan', 'Driver', 'Pemohon', 'Tujuan',
            'Lokasi', 'Tanggal Mulai', 'Tanggal Selesai', 'Status',
        ];
    }

    public function map($booking): array
    {
        return [
            $booking->booking_no,
            $booking->vehicle->label,
            $booking->driver->name,
            $booking->requester->name,
            $booking->purpose,
            $booking->region?->name,
            $booking->start_date->format('Y-m-d'),
            $booking->end_date->format('Y-m-d'),
            self::STATUS_LABEL[$booking->status] ?? $booking->status,
        ];
    }

    public function columnWidths(): array
    {
        return ['A' => 16, 'B' => 20, 'C' => 16, 'D' => 14, 'E' => 28, 'F' => 16, 'G' => 14, 'H' => 14, 'I' => 20];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
