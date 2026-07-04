// This file used to hold all the mock business data (users, vehicles, bookings,
// dashboard series...). That data now comes from the Laravel API through
// DataContext. The only thing that's genuinely static UI configuration —
// not data — is the status → label/color mapping used by <StatusBadge>.
export const statusLabel = {
  pending_l1: { label: "Menunggu Approval L1", color: "ore" },
  pending_l2: { label: "Menunggu Approval L2", color: "ore" },
  approved: { label: "Disetujui", color: "success" },
  rejected: { label: "Ditolak", color: "danger" },
  completed: { label: "Selesai", color: "brand" },
};
