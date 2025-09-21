// app/components/admin/dashboard/stats-grid.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Decimal } from "@prisma/client/runtime/library"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react"

interface StatsGridProps {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  revenue: Decimal | number
}

export function StatsGrid({ 
  totalProducts, 
  totalOrders, 
  totalCustomers, 
  revenue 
}: StatsGridProps) {
  const stats = [
    {
      title: "Total Revenue",
      value: `₹${revenue.toLocaleString()}`,
      description: "Total sales revenue",
      icon: DollarSign,
      trend: "+12.5%",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      description: "All time orders",
      icon: ShoppingCart,
      trend: "+5.2%",
    },
    {
      title: "Products",
      value: totalProducts.toString(),
      description: "Active products",
      icon: Package,
      trend: "+2.1%",
    },
    {
      title: "Customers",
      value: totalCustomers.toString(),
      description: "Registered customers",
      icon: Users,
      trend: "+8.3%",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <span>{stat.description}</span>
              <span className="flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}