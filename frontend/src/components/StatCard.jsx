export default function StatCard({ icon: Icon, label, value, sub, accent = "brand" }) {
  const barMap = {
    brand: "bg-brand-500",
    ore: "bg-ore-400",
    success: "bg-success-500",
    danger: "bg-danger-500",
  };
  const iconMap = {
    brand: "text-brand-600",
    ore: "text-ore-600",
    success: "text-success-700",
    danger: "text-danger-700",
  };
  return (
    <div className="relative bg-base-card border border-base-border rounded-xl pl-6 pr-5 py-5 shadow-card overflow-hidden">
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${barMap[accent]}`} aria-hidden="true" />
      <div className={`flex items-center gap-1.5 mb-2.5 ${iconMap[accent]}`}>
        <Icon size={15} strokeWidth={2.25} />
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      </div>
      <p className="font-display text-3xl font-semibold text-ink tabular-nums leading-none">{value}</p>
      {sub && <p className="text-xs text-ink-muted mt-2">{sub}</p>}
    </div>
  );
}
