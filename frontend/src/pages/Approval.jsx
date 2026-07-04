import { useState } from "react";
import { Check, X, MapPin, User, Calendar, CheckSquare } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function Approval() {
  const { user } = useAuth();
  const { bookings, decideBooking } = useData();
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState("");

  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const myLevel = user?.level; // 1 or 2 for approver accounts
  const pending = bookings.filter((b) => {
    if (b.status === "pending_l1" && myLevel === 1) return true;
    if (b.status === "pending_l2" && myLevel === 2) return true;
    return false;
  });

  async function decide(id, decision) {
    setBusyId(id);
    setError("");
    try {
      await decideBooking(id, decision, decision === "rejected" ? note : "");
      setNoteFor(null);
      setNote("");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim keputusan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Approval Saya" subtitle={`Pemesanan yang menunggu persetujuan Anda (Level ${myLevel ?? "-"}).`} />

      {error && (
        <div className="bg-danger-100 text-danger-700 text-sm px-3 py-2.5 rounded-lg">{error}</div>
      )}

      {pending.length === 0 ? (
        <EmptyState icon={CheckSquare} title="Semua sudah diproses" message="Tidak ada pemesanan yang menunggu persetujuan Anda saat ini." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pending.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="tag-mono text-sm font-semibold text-ink">{b.bookingNo}</p>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-sm font-medium text-ink mb-3">{b.purpose}</p>
              <div className="space-y-1.5 text-xs text-ink-muted mb-4">
                <p className="flex items-center gap-1.5"><User size={13} /> {b.driver} — {b.vehicle}</p>
                <p className="flex items-center gap-1.5"><MapPin size={13} /> {b.region}</p>
                <p className="flex items-center gap-1.5"><Calendar size={13} /> {b.startDate} s/d {b.endDate}</p>
              </div>

              {noteFor === b.id ? (
                <div className="space-y-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Alasan penolakan..."
                    className="w-full text-sm border border-base-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-danger-500/20 focus:border-danger-500 transition-shadow"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNoteFor(null)}
                      disabled={busyId === b.id}
                      className="flex-1 text-xs font-medium border border-base-border rounded-lg py-2 text-ink hover:bg-base disabled:opacity-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => decide(b.id, "rejected")}
                      disabled={busyId === b.id}
                      className="flex-1 text-xs font-medium bg-danger-500 hover:bg-danger-700 disabled:opacity-60 text-white rounded-lg py-2 transition-colors"
                    >
                      {busyId === b.id ? "Mengirim..." : "Kirim Penolakan"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setNoteFor(b.id)}
                    disabled={busyId === b.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium border border-danger-500 text-danger-500 rounded-lg py-2 hover:bg-danger-100 disabled:opacity-50 transition-colors"
                  >
                    <X size={14} /> Tolak
                  </button>
                  <button
                    onClick={() => decide(b.id, "approved")}
                    disabled={busyId === b.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-success-500 hover:bg-success-700 disabled:opacity-60 text-white rounded-lg py-2 transition-colors"
                  >
                    <Check size={14} /> {busyId === b.id ? "Memproses..." : "Setujui"}
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
