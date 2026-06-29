import type { Order } from "@/types/order.types";

export const COLUMNS: { key: Order["status"]; label: string; color: string }[] = [
  { key: "pending", label: "Pendiente", color: "border-t-[#e8b84b]" },
  { key: "confirmed", label: "Confirmado", color: "border-t-[#4a90e2]" },
  { key: "preparing", label: "Preparando", color: "border-t-[#f5a623]" },
  { key: "ready", label: "Listo", color: "border-t-[#27ae60]" },
  { key: "delivered", label: "Entregado", color: "border-t-[#b4a58c]" },
];

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
};