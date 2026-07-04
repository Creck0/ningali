import { Car, ClipboardCheck, Fuel, Wrench } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import { useData } from "../context/DataContext";

const chartTick = { fontSize: 12, fill: "#5C6B67" };
const tooltipStyle = { borderRadius: 10, border: "1px solid #DDE3E0", fontSize: 12 };

export default function Dashboard() {
  const { bookings, vehicles, fuelLogs, serviceLogs, dashboard } = useData();
  const { usagePerMonth, usagePerRegion, fuelTrend } = dashboard;
  const pendingCount = bookings.filter((b) => b.status.startsWith("pending")).length;
  const availableCount = vehicles.filter((v) => v.status === "available").length;

  const now = new Date("2026-07-03");
  const currentMonthKey = now.toISOString().slice(0, 7);
  const fuelThisMonth = fuelLogs
    .filter((f) => f.filledAt?.slice(0, 7) === currentMonthKey)
    .reduce((sum, f) => sum + f.liters, 0);

  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);
  const upcomingServiceCount = serviceLogs.filter((s) => {
    const due = new Date(s.nextDue);
    return due >= now && due <= in7Days;
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Ringkasan pemakaian & status armada kendaraan." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Car} label="Kendaraan Tersedia" value={`${availableCount} / ${vehicles.length}`} sub="Siap dipesan" accent="brand" />
        <StatCard icon={ClipboardCheck} label="Menunggu Approval" value={pendingCount} sub="Perlu tindakan approver" accent="ore" />
        <StatCard icon={Fuel} label="BBM Bulan Ini" value={`${fuelThisMonth.toLocaleString("id-ID")} L`} sub="Total liter tercatat" accent="success" />
        <StatCard icon={Wrench} label="Jadwal Service" value={upcomingServiceCount} sub="Dalam 7 hari ke depan" accent="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-5">
          <div className="mb-4">
            <h2 className="font-display font-semibold text-ink">Tren Pemakaian Kendaraan</h2>
            <p className="text-xs text-ink-muted">Jumlah perjalanan per bulan</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={usagePerMonth}>
              <defs>
                <linearGradient id="trips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F6F5E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2F6F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE3E0" vertical={false} />
              <XAxis dataKey="month" tick={chartTick} axisLine={false} tickLine={false} />
              <YAxis tick={chartTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="trips" name="Perjalanan" stroke="#2F6F5E" strokeWidth={2.5} fill="url(#trips)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink mb-1">Konsumsi BBM</h2>
          <p className="text-xs text-ink-muted mb-4">Liter per bulan</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fuelTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE3E0" vertical={false} />
              <XAxis dataKey="month" tick={chartTick} axisLine={false} tickLine={false} />
              <YAxis tick={chartTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="liter" name="Liter" fill="#E8A33D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-1 p-5">
          <h2 className="font-display font-semibold text-ink mb-1">Pemakaian per Lokasi</h2>
          <p className="text-xs text-ink-muted mb-4">Jumlah perjalanan bulan ini</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={usagePerRegion} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE3E0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#5C6B67" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 11, fill: "#5C6B67" }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="trips" name="Perjalanan" fill="#2F6F5E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="xl:col-span-2 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Pemesanan Terbaru</h2>
          <div className="space-y-3">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 pb-3 border-b border-base-border last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink tag-mono">{b.bookingNo}</p>
                  <p className="text-xs text-ink-muted truncate">{b.purpose}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
