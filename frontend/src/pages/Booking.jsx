import { useState } from "react";
import { Plus, Search, ChevronRight, Flag } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ModalShell, ModalActions, Field } from "../components/ui/Modal";
import { useData } from "../context/DataContext";

export default function Booking() {
  const { bookings, addBooking, completeBooking, vehicles, drivers, approversL1, approversL2, regions } = useData();
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = bookings.filter(
    (b) =>
      b.bookingNo.toLowerCase().includes(query.toLowerCase()) ||
      b.purpose.toLowerCase().includes(query.toLowerCase()) ||
      b.driver.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemesanan Kendaraan"
        subtitle="Kelola seluruh pemesanan kendaraan operasional."
        actions={
          <button
            onClick={() => setShowForm(true)}
            disabled={vehicles.length === 0}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            Buat Pemesanan
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari no. pemesanan, driver, tujuan..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-base-border bg-base-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada pemesanan"
          message={query ? "Tidak ada pemesanan yang cocok dengan pencarian." : "Buat pemesanan pertama untuk mulai melacak penggunaan armada."}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => setDetail(b)}
                className="text-left bg-base-card border border-base-border rounded-xl p-4 shadow-card active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-ink tag-mono">{b.bookingNo}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-sm text-ink mb-1">{b.purpose}</p>
                <p className="text-xs text-ink-muted">{b.vehicle} · {b.driver}</p>
                <p className="text-xs text-ink-muted mt-1">{b.region} · {b.startDate}</p>
              </button>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden lg:block overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-border bg-base/60 text-left">
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">No. Pemesanan</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Kendaraan</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Driver</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Tujuan</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Lokasi</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Tanggal</th>
                  <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-base-border last:border-0 hover:bg-base/40 cursor-pointer transition-colors" onClick={() => setDetail(b)}>
                    <td className="px-5 py-3.5 tag-mono font-medium text-ink">{b.bookingNo}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{b.vehicle}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{b.driver}</td>
                    <td className="px-5 py-3.5 text-ink max-w-[220px] truncate">{b.purpose}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{b.region}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{b.startDate}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-3.5 text-ink-muted"><ChevronRight size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {showForm && (
        <BookingFormModal
          onClose={() => setShowForm(false)}
          onSave={addBooking}
          vehicles={vehicles}
          drivers={drivers}
          approversL1={approversL1}
          approversL2={approversL2}
          regions={regions}
        />
      )}
      {detail && (
        <BookingDetailModal
          booking={detail}
          onClose={() => setDetail(null)}
          onComplete={completeBooking}
        />
      )}
    </div>
  );
}

function BookingFormModal({ onClose, onSave, vehicles, drivers, approversL1, approversL2, regions }) {
  const [form, setForm] = useState({
    vehicle: `${vehicles[0].code} · ${vehicles[0].plate}`,
    driver: drivers[0]?.name ?? "",
    purpose: "",
    region: regions[0]?.name ?? "",
    startDate: "",
    endDate: "",
    approverL1: approversL1[0]?.name ?? "",
    approverL2: approversL2[0]?.name ?? "",
    odometerStart: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <ModalShell title="Buat Pemesanan Baru" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSaving(true);
          setError("");
          try {
            await onSave(form);
            onClose();
          } catch (err) {
            setError(
              err.response?.data?.message ||
                Object.values(err.response?.data?.errors || {})[0]?.[0] ||
                "Gagal menyimpan pemesanan."
            );
          } finally {
            setIsSaving(false);
          }
        }}
        className="p-6 space-y-4"
      >
        {error && (
          <div className="bg-danger-100 text-danger-700 text-sm px-3 py-2.5 rounded-lg">{error}</div>
        )}
        <Field label="Kendaraan">
          <select className="input-select" value={form.vehicle} onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}>
            {vehicles.map((v) => (
              <option key={v.id}>{v.code} · {v.plate}</option>
            ))}
          </select>
        </Field>
        <Field label="Driver">
          <select className="input-select" value={form.driver} onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}>
            {drivers.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Tujuan / Keperluan">
          <input
            required
            className="input-select"
            placeholder="mis. Antar tim survey ke Site A"
            value={form.purpose}
            onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
          />
        </Field>
        <Field label="Lokasi">
          <select className="input-select" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}>
            {regions.map((r) => <option key={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal Mulai">
            <input required type="date" className="input-select" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          </Field>
          <Field label="Tanggal Selesai">
            <input required type="date" className="input-select" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </Field>
        </div>
        <Field label="Odometer Awal (km) — opsional">
          <input
            type="number"
            className="input-select"
            placeholder="mis. 18420"
            value={form.odometerStart}
            onChange={(e) => setForm((f) => ({ ...f, odometerStart: e.target.value }))}
          />
        </Field>
        <Field label="Approver Level 1">
          <select className="input-select" value={form.approverL1} onChange={(e) => setForm((f) => ({ ...f, approverL1: e.target.value }))}>
            {approversL1.map((a) => <option key={a.id} value={a.name}>{a.label}</option>)}
          </select>
        </Field>
        <Field label="Approver Level 2">
          <select className="input-select" value={form.approverL2} onChange={(e) => setForm((f) => ({ ...f, approverL2: e.target.value }))}>
            {approversL2.map((a) => <option key={a.id} value={a.name}>{a.label}</option>)}
          </select>
        </Field>
        <ModalActions onClose={onClose} isSaving={isSaving} saveLabel="Simpan Pemesanan" />
      </form>
    </ModalShell>
  );
}

function BookingDetailModal({ booking, onClose, onComplete }) {
  const [showComplete, setShowComplete] = useState(false);

  return (
    <ModalShell title={booking.bookingNo} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 space-y-5">
        <div>
          <StatusBadge status={booking.status} />
          <p className="text-sm text-ink mt-3">{booking.purpose}</p>
        </div>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-ink-muted">Kendaraan</dt><dd className="text-ink text-right">{booking.vehicle}</dd>
          <dt className="text-ink-muted">Driver</dt><dd className="text-ink text-right">{booking.driver}</dd>
          <dt className="text-ink-muted">Lokasi</dt><dd className="text-ink text-right">{booking.region}</dd>
          <dt className="text-ink-muted">Tanggal</dt><dd className="text-ink text-right">{booking.startDate} s/d {booking.endDate}</dd>
          <dt className="text-ink-muted">Pemohon</dt><dd className="text-ink text-right">{booking.requester}</dd>
          {booking.odometerStart != null && (
            <>
              <dt className="text-ink-muted">Odometer Awal</dt>
              <dd className="text-ink text-right tag-mono">{booking.odometerStart.toLocaleString("id-ID")} km</dd>
            </>
          )}
          {booking.odometerEnd != null && (
            <>
              <dt className="text-ink-muted">Odometer Akhir</dt>
              <dd className="text-ink text-right tag-mono">{booking.odometerEnd.toLocaleString("id-ID")} km</dd>
            </>
          )}
        </dl>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">Jejak Persetujuan</p>
          <div className="space-y-2">
            {booking.approvals.map((a) => (
              <div key={a.level} className="flex items-center justify-between border border-base-border rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-sm text-ink font-medium">Level {a.level} — {a.name}</p>
                  {a.note && <p className="text-xs text-ink-muted mt-0.5">Catatan: {a.note}</p>}
                </div>
                <ApprovalStepBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>

        {booking.status === "approved" && (
          <button
            onClick={() => setShowComplete(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            <Flag size={15} /> Selesaikan Pemesanan
          </button>
        )}
      </div>

      {showComplete && (
        <CompleteBookingModal
          booking={booking}
          onClose={() => setShowComplete(false)}
          onSave={async (payload) => {
            await onComplete(booking.id, payload);
            setShowComplete(false);
            onClose();
          }}
        />
      )}
    </ModalShell>
  );
}

function CompleteBookingModal({ booking, onClose, onSave }) {
  const [form, setForm] = useState({
    odometerEnd: "",
    liters: "",
    cost: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <ModalShell title={`Selesaikan ${booking.bookingNo}`} icon={Flag} onClose={onClose} maxWidth="max-w-md" z="z-[60]">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSaving(true);
          setError("");
          try {
            await onSave(form);
          } catch (err) {
            setError(err.response?.data?.message || "Gagal menyelesaikan pemesanan.");
            setIsSaving(false);
          }
        }}
        className="p-6 space-y-4"
      >
        {error && (
          <div className="bg-danger-100 text-danger-700 text-sm px-3 py-2.5 rounded-lg">{error}</div>
        )}
        <p className="text-xs text-ink-muted -mt-1">
          Kendaraan telah kembali. Catat odometer akhir dan pengisian BBM (opsional), status pemesanan akan menjadi
          "Selesai" dan kendaraan kembali tersedia.
        </p>
        <Field label="Odometer Akhir (km)">
          <input
            required
            type="number"
            className="input-select"
            placeholder={booking.odometerStart ? `min. ${booking.odometerStart}` : "mis. 18540"}
            value={form.odometerEnd}
            onChange={(e) => setForm((f) => ({ ...f, odometerEnd: e.target.value }))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Liter BBM — opsional">
            <input
              type="number"
              className="input-select"
              value={form.liters}
              onChange={(e) => setForm((f) => ({ ...f, liters: e.target.value }))}
            />
          </Field>
          <Field label="Biaya BBM (Rp) — opsional">
            <input
              type="number"
              className="input-select"
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
            />
          </Field>
        </div>
        <ModalActions onClose={onClose} isSaving={isSaving} saveLabel="Simpan & Selesaikan" tone="ink" />
      </form>
    </ModalShell>
  );
}

function ApprovalStepBadge({ status }) {
  const map = {
    pending: { label: "Menunggu", cls: "bg-ore-100 text-ore-600" },
    approved: { label: "Disetujui", cls: "bg-success-100 text-success-700" },
    rejected: { label: "Ditolak", cls: "bg-danger-100 text-danger-700" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}
