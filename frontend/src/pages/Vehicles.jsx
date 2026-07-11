import { Fuel, Wrench, Plus, Car, AlertTriangle } from "lucide-react";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ModalShell, ModalActions, Field } from "../components/ui/Modal";
import { useData } from "../context/DataContext";
import { useState } from "react";

const statusStyle = {
  available: "bg-success-100 text-success-700",
  in_use: "bg-brand-100 text-brand-700",
  maintenance: "bg-danger-100 text-danger-700",
};
const statusText = {
  available: "Tersedia",
  in_use: "Dipakai",
  maintenance: "Maintenance",
};

const tabs = [
  { key: "vehicles", label: "Daftar Kendaraan" },
  { key: "fuel", label: "Konsumsi BBM" },
  { key: "service", label: "Jadwal Service" },
];

const TODAY = new Date();
const SOON_WINDOW_DAYS = 7;

// Purely a display hint (the "Servis lewat X hari" badge). The actual
// auto-maintenance decision — and remembering that an admin overrode it back
// to "available" — is handled and persisted by the backend now, so this stays
// in sync across logins/devices instead of resetting on every page load.
function getServiceAlert(vehicleLabel, serviceLogs) {
  const logs = serviceLogs.filter((s) => s.vehicle === vehicleLabel && s.nextDue);
  if (logs.length === 0) return null;

  const soonest = logs.reduce((earliest, log) => {
    const due = new Date(log.nextDue);
    return !earliest || due < earliest ? due : earliest;
  }, null);

  const dueKey = soonest.toISOString().slice(0, 10);
  const diffDays = Math.ceil((soonest - TODAY) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { level: "overdue", label: `Servis lewat ${Math.abs(diffDays)} hari`, dueKey };
  if (diffDays <= SOON_WINDOW_DAYS) {
    return {
      level: "soon",
      label: diffDays === 0 ? "Servis jatuh tempo hari ini" : `Servis dalam ${diffDays} hari`,
      dueKey,
    };
  }
  return null;
}

export default function Vehicles() {
  const { vehicles, fuelLogs, serviceLogs, addFuelLog, addServiceLog, updateVehicleStatus } = useData();
  const [tab, setTab] = useState("vehicles");
  const [modal, setModal] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [busyVehicleId, setBusyVehicleId] = useState(null);

  async function handleStatusChange(vehicleId, status) {
    setBusyVehicleId(vehicleId);
    setStatusError("");
    try {
      await updateVehicleStatus(vehicleId, status);
    } catch (err) {
      setStatusError(
        err.response?.data?.message ||
          "Gagal menyimpan perubahan status ke server. Status akan kembali seperti semula."
      );
    } finally {
      setBusyVehicleId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Kendaraan" subtitle="Monitoring status Kendaraan, konsumsi BBM, dan jadwal service." />

      {statusError && (
        <div className="bg-danger-100 text-danger-700 text-sm px-3 py-2.5 rounded-lg">{statusError}</div>
      )}

      <div className="flex gap-2 border-b border-base-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t.key ? "border-brand-500 text-brand-600" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "vehicles" && (
        vehicles.length === 0 ? (
          <EmptyState icon={Car} title="Belum ada kendaraan" message="Tambahkan kendaraan pada sistem untuk mulai mengelola armada." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {vehicles.map((v) => {
              const rawAlert = getServiceAlert(`${v.code} · ${v.plate}`, serviceLogs);
              const acknowledged =
                v.status === "available" && rawAlert?.level === "overdue" && v.maintenanceOverrideKey === rawAlert.dueKey;
              const alert = acknowledged ? null : rawAlert;
              return (
                <Card key={v.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Car size={20} />
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusStyle[v.status]}`}>
                      {statusText[v.status]}
                    </span>
                  </div>
                  <p className="tag-mono text-sm font-semibold text-ink">{v.code}</p>
                  <p className="text-xs text-ink-muted mb-3">{v.plate}</p>
                  <div className="text-xs text-ink-muted space-y-1 mb-3">
                    <p>{v.type} · {v.ownership}</p>
                    <p>{v.region}</p>
                  </div>
                  {alert && (
                    <div
                      className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-2.5 py-2 mb-3 ${
                        alert.level === "overdue" ? "bg-danger-100 text-danger-700" : "bg-ore-100 text-ore-600"
                      }`}
                    >
                      <AlertTriangle size={13} />
                      {alert.label}
                    </div>
                  )}
                  <select
                    value={v.status}
                    disabled={busyVehicleId === v.id}
                    onChange={(e) => handleStatusChange(v.id, e.target.value)}
                    className="input-select text-xs py-2 disabled:opacity-60"
                  >
                    <option value="available">Tersedia</option>
                    <option value="in_use">Dipakai</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </Card>
              );
            })}
          </div>
        )
      )}

      {tab === "fuel" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setModal("fuel")}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Catat Pengisian BBM
            </button>
          </div>

          {fuelLogs.length === 0 ? (
            <EmptyState icon={Fuel} title="Belum ada catatan BBM" message="Catat pengisian bahan bakar untuk mulai memantau konsumsi tiap kendaraan." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {fuelLogs.map((f) => (
                  <Card key={f.id} className="p-4">
                    <div className="flex items-start justify-between mb-1.5">
                      <p className="text-sm font-medium text-ink">{f.vehicle}</p>
                      <p className="text-xs text-ink-muted tag-mono">{f.filledAt}</p>
                    </div>
                    <p className="text-xs text-ink-muted tag-mono">
                      {f.liters} L · Rp {f.cost.toLocaleString("id-ID")} · {f.odometer.toLocaleString("id-ID")} km
                    </p>
                  </Card>
                ))}
              </div>

              <Card className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-base-border bg-base/60 text-left">
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Kendaraan</th>
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Liter</th>
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Biaya</th>
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Odometer</th>
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelLogs.map((f) => (
                      <tr key={f.id} className="border-b border-base-border last:border-0 hover:bg-base/40 transition-colors">
                        <td className="px-5 py-3.5 text-ink">{f.vehicle}</td>
                        <td className="px-5 py-3.5 text-ink-muted tag-mono">{f.liters} L</td>
                        <td className="px-5 py-3.5 text-ink-muted tag-mono">Rp {f.cost.toLocaleString("id-ID")}</td>
                        <td className="px-5 py-3.5 text-ink-muted tag-mono">{f.odometer.toLocaleString("id-ID")} km</td>
                        <td className="px-5 py-3.5 text-ink-muted">{f.filledAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "service" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setModal("service")}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Catat Service
            </button>
          </div>

          {serviceLogs.length === 0 ? (
            <EmptyState icon={Wrench} title="Belum ada catatan service" message="Catat riwayat service untuk memantau jadwal perawatan tiap kendaraan." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {serviceLogs.map((s) => (
                  <Card key={s.id} className="p-4">
                    <div className="flex items-start justify-between mb-1.5">
                      <p className="text-sm font-medium text-ink">{s.vehicle}</p>
                      <p className="text-xs text-ink-muted tag-mono">Rp {s.cost.toLocaleString("id-ID")}</p>
                    </div>
                    <p className="text-xs text-ink-muted">{s.type}</p>
                    <p className="text-xs text-ink-muted mt-1">{s.serviceDate} · berikutnya {s.nextDue}</p>
                  </Card>
                ))}
              </div>

              <Card className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-base-border bg-base/60 text-left">
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Kendaraan</th>
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Jenis Service</th>
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Biaya</th>
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Tanggal</th>
                      <th className="px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wide">Jadwal Berikutnya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceLogs.map((s) => (
                      <tr key={s.id} className="border-b border-base-border last:border-0 hover:bg-base/40 transition-colors">
                        <td className="px-5 py-3.5 text-ink">{s.vehicle}</td>
                        <td className="px-5 py-3.5 text-ink-muted">{s.type}</td>
                        <td className="px-5 py-3.5 text-ink-muted tag-mono">Rp {s.cost.toLocaleString("id-ID")}</td>
                        <td className="px-5 py-3.5 text-ink-muted">{s.serviceDate}</td>
                        <td className="px-5 py-3.5 text-ink-muted">{s.nextDue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      )}

      {modal === "fuel" && (
        <FuelModal vehicles={vehicles} onClose={() => setModal(null)} onSave={addFuelLog} />
      )}
      {modal === "service" && (
        <ServiceModal vehicles={vehicles} onClose={() => setModal(null)} onSave={addServiceLog} />
      )}
    </div>
  );
}

function FuelModal({ vehicles, onClose, onSave }) {
  const [form, setForm] = useState({ vehicle: `${vehicles[0].code} · ${vehicles[0].plate}`, liters: "", cost: "", odometer: "", filledAt: new Date().toISOString().slice(0, 10) });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  return (
    <ModalShell title="Catat Pengisian BBM" icon={Fuel} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSaving(true);
          setError("");
          try {
            await onSave({ ...form, liters: Number(form.liters), cost: Number(form.cost), odometer: Number(form.odometer) });
            onClose();
          } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan catatan BBM.");
            setIsSaving(false);
          }
        }}
        className="p-6 space-y-4"
      >
        {error && <div className="bg-danger-100 text-danger-700 text-sm px-3 py-2.5 rounded-lg">{error}</div>}
        <Field label="Kendaraan">
          <select className="input-select" value={form.vehicle} onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}>
            {vehicles.map((v) => <option key={v.id}>{v.code} · {v.plate}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Liter"><input required type="number" className="input-select" value={form.liters} onChange={(e) => setForm((f) => ({ ...f, liters: e.target.value }))} /></Field>
          <Field label="Biaya (Rp)"><input required type="number" className="input-select" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} /></Field>
        </div>
        <Field label="Odometer (km)"><input required type="number" className="input-select" value={form.odometer} onChange={(e) => setForm((f) => ({ ...f, odometer: e.target.value }))} /></Field>
        <Field label="Tanggal"><input required type="date" className="input-select" value={form.filledAt} onChange={(e) => setForm((f) => ({ ...f, filledAt: e.target.value }))} /></Field>
        <ModalActions onClose={onClose} isSaving={isSaving} />
      </form>
    </ModalShell>
  );
}

function ServiceModal({ vehicles, onClose, onSave }) {
  const [form, setForm] = useState({ vehicle: `${vehicles[0].code} · ${vehicles[0].plate}`, type: "", cost: "", serviceDate: new Date().toISOString().slice(0, 10), nextDue: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  return (
    <ModalShell title="Catat Service Kendaraan" icon={Wrench} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSaving(true);
          setError("");
          try {
            await onSave({ ...form, cost: Number(form.cost) });
            onClose();
          } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan catatan service.");
            setIsSaving(false);
          }
        }}
        className="p-6 space-y-4"
      >
        {error && <div className="bg-danger-100 text-danger-700 text-sm px-3 py-2.5 rounded-lg">{error}</div>}
        <Field label="Kendaraan">
          <select className="input-select" value={form.vehicle} onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}>
            {vehicles.map((v) => <option key={v.id}>{v.code} · {v.plate}</option>)}
          </select>
        </Field>
        <Field label="Jenis Service"><input required className="input-select" placeholder="mis. Ganti Oli & Filter" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} /></Field>
        <Field label="Biaya (Rp)"><input required type="number" className="input-select" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal Service"><input required type="date" className="input-select" value={form.serviceDate} onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))} /></Field>
          <Field label="Jadwal Berikutnya"><input required type="date" className="input-select" value={form.nextDue} onChange={(e) => setForm((f) => ({ ...f, nextDue: e.target.value }))} /></Field>
        </div>
        <ModalActions onClose={onClose} isSaving={isSaving} />
      </form>
    </ModalShell>
  );
}
