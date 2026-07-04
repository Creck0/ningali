import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = [
  { role: "Admin Pesanan", email: "admin@mail.co", password: "Admin#12345" },
  { role: "Approval", email: "admin_approv@mail.com", password: "Approve#123" },
  { role: "Approval Manager", email: "manager@mail.com", password: "Approve#456" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }
    navigate(result.user.role === "approver" ? "/approval" : "/");
  }

  function quickFill(demoEmail, demoPassword) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-contour-dark flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-ore-400 flex items-center justify-center">
            <Truck size={20} className="text-ink" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-white text-lg tracking-tight">Ningali</span>
        </div>

        <p className="font-display text-2xl xl:text-3xl font-semibold text-white leading-snug max-w-md">
          Sistem Pemantauan seluruh armada tambang.
        </p>

        <p className="text-white/40 text-xs tag-mono">PT SUKSES TAMBANG REZEKI</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-base">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-md bg-ore-400 flex items-center justify-center">
              <Truck size={20} className="text-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-ink text-lg tracking-tight">Ningali</span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink mb-1">Masuk ke akun Anda</h1>
          <p className="text-sm text-ink-muted mb-8">Gunakan akun admin atau approver yang terdaftar.</p>

          {error && (
            <div className="flex items-center gap-2 bg-danger-100 text-danger-700 text-sm px-3 py-2.5 rounded-lg mb-4">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-base-border bg-base-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-base-border bg-base-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-70 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              {isSubmitting ? "Memeriksa akun..." : "Masuk"}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-brand-50 border border-brand-100">
            <p className="text-xs font-semibold text-brand-700 mb-2 uppercase tracking-wide">
              Akun Demo — klik untuk isi otomatis
            </p>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => quickFill(account.email, account.password)}
                className="block w-full text-left text-xs text-ink-muted tag-mono hover:text-brand-600 py-0.5"
              >
                {account.email} / {account.password}
                <span className="text-ink-muted/60"> — {account.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
