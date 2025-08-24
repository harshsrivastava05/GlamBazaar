import { Suspense } from "react";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
} from "lucide-react";

async function DashboardStats() {
  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    }),
    prisma.productVariant.findMany({
      where: { stockQuantity: { lte: 5 } },
      include: {
        product: { select: { name: true } },
      },
      take: 10,
    }),
  ]);

  const revenue = totalRevenue._sum.totalAmount || 0;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${revenue.toLocaleString()}`,
      description: "Total sales revenue",
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      description: "All time orders",
      icon: ShoppingCart,
      trend: "+5.2%",
      trendUp: true,
    },
    {
      title: "Products",
      value: totalProducts.toString(),
      description: "Active products",
      icon: Package,
      trend: "+2.1%",
      trendUp: true,
    },
    {
      title: "Customers",
      value: totalCustomers.toString(),
      description: "Registered customers",
      icon: Users,
      trend: "+8.3%",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{stat.description}</span>
                <span
                  className={`flex items-center ${
                    stat.trendUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.user.name} • {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ₹{order.totalAmount.toString()}
                    </p>
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "default"
                          : order.status === "PROCESSING"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
            <CardDescription>Products running low on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {variant.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SKU: {variant.sku}
                    </p>
                  </div>
                  <Badge
                    variant={
                      variant.stockQuantity === 0 ? "destructive" : "outline"
                    }
                    className="text-xs"
                  >
                    {variant.stockQuantity} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your GlamBazar admin dashboard
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-5 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <div className="space-y-1">
                            <div className="h-4 bg-muted rounded animate-pulse w-24" />
                            <div className="h-3 bg-muted rounded animate-pulse w-32" />
                          </div>
                          <div className="h-6 bg-muted rounded animate-pulse w-16" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        }
      >
        <DashboardStats />
      </Suspense>
    </div>
  );
}
