import { useState } from "react";
import { FileSpreadsheet, Download, FileBarChart } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { useData } from "../context/DataContext";

export default function Reports() {
  const { bookings, exportBookingsReport } = useData();
  const [range, setRange] = useState({ from: "2026-06-01", to: "2026-07-03" });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const filteredBookings = bookings.filter(
    (b) => b.startDate >= range.from && b.startDate <= range.to
  );

  async function handleExport() {
    setIsExporting(true);
    setError("");
    try {
      await exportBookingsReport(range.from, range.to);
    } catch (err) {
      setError("Gagal mengekspor laporan. Pastikan server API berjalan.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Pemesanan" subtitle="Rekap periodik pemesanan kendaraan, dapat diekspor ke Excel." />

      <Card className="p-5 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">Dari Tanggal</span>
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="input-select"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">Sampai Tanggal</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="input-select"
            />
          </label>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredBookings.length === 0 || isExporting}
          className="inline-flex items-center justify-center gap-2 bg-success-500 hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
        >
          <FileSpreadsheet size={16} />
          {isExporting ? "Menyiapkan file..." : "Export Excel"}
          {!isExporting && <Download size={14} />}
        </button>
      </Card>
      {error && <p className="text-sm text-danger-700">{error}</p>}

      {filteredBookings.length === 0 ? (
        <EmptyState icon={FileBarChart} title="Tidak ada data" message="Tidak ada pemesanan pada rentang tanggal ini. Coba ubah rentang tanggal." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredBookings.map((b) => (
              <Card key={b.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-ink tag-mono">{b.bookingNo}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-ink-muted">{b.vehicle} · {b.driver}</p>
                <p className="text-xs text-ink-muted mt-1">{b.region} · {b.startDate}</p>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden sm:block overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-base-border bg-base/60 text-left">
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">No. Pemesanan</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Kendaraan</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Driver</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Lokasi</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Tanggal</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="border-b border-base-border last:border-0 hover:bg-base/40 transition-colors">
                    <td className="px-5 py-3.5 tag-mono font-medium text-ink">{b.bookingNo}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{b.vehicle}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{b.driver}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{b.region}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{b.startDate}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
