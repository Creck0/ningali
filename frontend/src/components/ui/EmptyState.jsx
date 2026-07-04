export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="bg-contour border border-dashed border-base-border rounded-xl p-10 sm:p-14 text-center">
      {Icon && (
        <div className="w-11 h-11 rounded-lg bg-base-card border border-base-border flex items-center justify-center mx-auto mb-3 shadow-card">
          <Icon size={20} className="text-ink-muted" />
        </div>
      )}
      {title && <p className="text-sm font-semibold text-ink mb-1">{title}</p>}
      <p className="text-sm text-ink-muted max-w-sm mx-auto">{message}</p>
    </div>
  );
}
