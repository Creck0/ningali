import { useState } from "react";
import { Search, ScrollText } from "lucide-react";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { useData } from "../context/DataContext";

const actionColor = {
  login: "bg-brand-100 text-brand-700",
  logout: "bg-base text-ink-muted",
  booking_created: "bg-brand-100 text-brand-700",
  booking_completed: "bg-brand-100 text-brand-700",
  approved_l1: "bg-success-100 text-success-700",
  approved_l2: "bg-success-100 text-success-700",
  rejected_l1: "bg-danger-100 text-danger-700",
  rejected_l2: "bg-danger-100 text-danger-700",
  vehicle_updated: "bg-ore-100 text-ore-600",
  fuel_log_added: "bg-ore-100 text-ore-600",
  service_log_added: "bg-ore-100 text-ore-600",
  report_exported: "bg-ore-100 text-ore-600",
};

export default function ActivityLog() {
  const { activityLogs } = useData();
  const [query, setQuery] = useState("");

  const filtered = activityLogs.filter(
    (l) =>
      l.description.toLowerCase().includes(query.toLowerCase()) ||
      l.user.toLowerCase().includes(query.toLowerCase()) ||
      l.module.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Log Aktivitas" subtitle="Audit trail seluruh proses dalam sistem." />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari user, modul, aktivitas..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-base-border bg-base-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="Tidak ada aktivitas" message="Tidak ada aktivitas yang cocok dengan pencarian." />
      ) : (
        <Card className="divide-y divide-base-border">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-5 py-4">
              <div className="w-8 h-8 rounded-lg bg-base flex items-center justify-center shrink-0 mt-0.5">
                <ScrollText size={15} className="text-ink-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-medium text-ink">{log.user}</span>
                  <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${actionColor[log.action] || "bg-base text-ink-muted"}`}>
                    {log.module}
                  </span>
                </div>
                <p className="text-sm text-ink-muted">{log.description}</p>
              </div>
              <p className="text-xs text-ink-muted tag-mono shrink-0">{log.time}</p>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
