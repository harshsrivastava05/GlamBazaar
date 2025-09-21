// app/components/admin/dashboard/dashboard-stats.tsx
import { prisma } from "@/lib/db";
import { StatsGrid } from "./stats-grid";
import { RecentOrders } from "./recent-orders";
import { LowStockAlert } from "./low-stock-alert";

async function getDashboardData() {
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

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    revenue: totalRevenue._sum.totalAmount || 0,
    recentOrders,
    lowStockProducts: lowStockProducts.map(pv => ({
      ...pv,
      id: pv.id.toString(),
    })),
  };
}

export async function DashboardStats() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 lg:space-y-8" suppressHydrationWarning>
      <StatsGrid
        totalProducts={data.totalProducts}
        totalOrders={data.totalOrders}
        totalCustomers={data.totalCustomers}
        revenue={data.revenue}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrders orders={data.recentOrders} />
        <LowStockAlert products={data.lowStockProducts} />
      </div>
    </div>
  );
}
