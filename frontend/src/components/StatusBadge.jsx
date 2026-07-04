import { statusLabel } from "../data/mockData";

const colorMap = {
  ore: "bg-ore-100 text-ore-600",
  success: "bg-success-100 text-success-700",
  danger: "bg-danger-100 text-danger-700",
  brand: "bg-brand-100 text-brand-700",
};

export default function StatusBadge({ status }) {
  const s = statusLabel[status] || { label: status, color: "brand" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tag-mono uppercase tracking-wide ${colorMap[s.color]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
