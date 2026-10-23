// Shared utility functions for Dealer portal
import type { Order } from "../../types/order";
import { getOrderDisplayNumber } from "../../utils/orderDisplay";

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

export const getDisplayRequestNumber = (order: Order): string => {
  return getOrderDisplayNumber(order);
};

export const statusBadgeClass = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes("manufacturer"))                    return "status-badge-pending";
  if (s.includes("financehead"))                      return "status-badge-review";
  if (s.includes("sales manager"))                   return "status-badge-quotation";
  if (s.includes("dealer manager"))                  return "status-badge-review";
  if (s.includes("pending"))                         return "status-badge-pending";
  if (s.includes("review"))                          return "status-badge-review";
  if (s.includes("quotation") || s.includes("finance")) return "status-badge-quotation";
  if (s.includes("deliver"))                         return "status-badge-approved";
  if (s.includes("approv"))                          return "status-badge-approved";
  if (s.includes("reject") || s.includes("decline")) return "status-badge-rejected";
  return "status-badge-default";
};

export const deriveStats = (orders: Order[]) => {
  const pending = orders.filter((o) => {
    const s = o.status.toLowerCase();
    return s.includes("review") || s.includes("pending") || s.includes("approval") || s.includes("quotation") || s.includes("manufacturer") || s.includes("financehead") || s.includes("sales manager") || s.includes("dealer manager");
  }).length;
  const approved = orders.filter((o) => {
    const s = o.status.toLowerCase();
    return s.includes("approv") || s.includes("deliver");
  }).length;
  const rejected = orders.filter((o) => {
    const s = o.status.toLowerCase();
    return s.includes("reject") || s.includes("decline");
  }).length;
  return {
    total: orders.length,
    pending,
    approved,
    rejected,
  };
};
