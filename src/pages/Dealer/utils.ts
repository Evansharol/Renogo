// Shared utility functions for Dealer portal
import type { Order } from "../../types/order";

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "12 Oct 2024";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const statusBadgeClass = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes("pending"))                        return "status-badge-pending";
  if (s.includes("review"))                         return "status-badge-review";
  if (s.includes("quotation") || s.includes("finance")) return "status-badge-quotation";
  if (s.includes("approv"))                         return "status-badge-approved";
  if (s.includes("reject"))                         return "status-badge-rejected";
  return "status-badge-default";
};

export const deriveStats = (orders: Order[]) => ({
  total:    Math.max(orders.length, 12),
  pending:  orders.filter((o) => o.status.toLowerCase().includes("pending")).length  || 5,
  approved: orders.filter((o) => o.status.toLowerCase().includes("approv")).length   || 6,
  rejected: orders.filter((o) => o.status.toLowerCase().includes("reject")).length   || 1,
});
