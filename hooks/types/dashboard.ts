// app/types/dashboard.ts
export interface DashboardOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  createdAt: Date
  user: {
    name: string | null
    email: string | null
  }
  items: Array<{
    id: string
    quantity: number
    product: {
      name: string
    }
  }>
}

export interface DashboardProductVariant {
  id: string
  sku: string
  stockQuantity: number
  product: {
    name: string
  }
}

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  revenue: number
}

export interface StatItem {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend: string
  trendUp: boolean
}