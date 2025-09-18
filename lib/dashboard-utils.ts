// app/lib/dashboard-utils.ts
import { type DashboardOrder } from "@/hooks/types/dashboard"

export function getOrderStatusVariant(status: string) {
  switch (status) {
    case "DELIVERED":
      return "default" as const
    case "PROCESSING":
      return "secondary" as const
    case "SHIPPED":
      return "outline" as const
    case "PENDING":
      return "outline" as const
    case "CANCELLED":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

export function getStockVariant(stockQuantity: number) {
  if (stockQuantity === 0) return "destructive" as const
  if (stockQuantity <= 5) return "outline" as const
  return "secondary" as const
}

export function formatCurrency(amount: number, currency: string = "₹"): string {
  return `${currency}${amount.toLocaleString()}`
}

export function formatOrderItems(order: DashboardOrder): string {
  const itemCount = order.items.length
  return `${itemCount} item${itemCount !== 1 ? 's' : ''}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}