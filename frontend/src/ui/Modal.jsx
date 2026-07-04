import { X } from "lucide-react";

export function ModalShell({ title, icon: Icon, onClose, children, maxWidth = "max-w-lg", z = "z-50" }) {
  return (
    <div className={`fixed inset-0 ${z} flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-[2px] p-0 sm:p-4`}>
      <div className={`bg-base-card w-full ${maxWidth} sm:rounded-xl rounded-t-2xl shadow-card max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-border sticky top-0 bg-base-card">
          <h2 className="font-display font-semibold text-ink flex items-center gap-2">
            {Icon && <Icon size={18} />} {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="text-ink-muted hover:text-ink hover:bg-base rounded-md p-1 -mr-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ onClose, isSaving, saveLabel = "Simpan", savingLabel = "Menyimpan...", tone = "brand" }) {
  const toneMap = {
    brand: "bg-brand-500 hover:bg-brand-600",
    danger: "bg-danger-500 hover:bg-danger-700",
    ink: "bg-ink hover:bg-ink/90",
  };
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="flex-1 border border-base-border text-ink text-sm font-medium py-2.5 rounded-lg hover:bg-base disabled:opacity-50 transition-colors"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className={`flex-1 disabled:opacity-70 text-white text-sm font-medium py-2.5 rounded-lg transition-colors ${toneMap[tone]}`}
      >
        {isSaving ? savingLabel : saveLabel}
      </button>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}
