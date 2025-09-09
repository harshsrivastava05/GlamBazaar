import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface LowStockProduct {
  id: number;
  name: string;
  totalStock: number;
}

// GET /api/admin/dashboard - Get dashboard overview
export async function GET() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayOrders,
      todayRevenue,
      weeklyOrders,
      weeklyRevenue,
      monthlyOrders,
      monthlyRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      // Today's orders count
      prisma.order.count({
        where: {
          createdAt: { gte: new Date(today.setHours(0, 0, 0, 0)) },
          status: { not: "CANCELLED" },
        },
      }),

      // Today's revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: new Date(today.setHours(0, 0, 0, 0)) },
          status: { not: "CANCELLED" },
        },
        _sum: { totalAmount: true },
      }),

      // Weekly orders
      prisma.order.count({
        where: {
          createdAt: { gte: thisWeek },
          status: { not: "CANCELLED" },
        },
      }),

      // Weekly revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thisWeek },
          status: { not: "CANCELLED" },
        },
        _sum: { totalAmount: true },
      }),

      // Monthly orders
      prisma.order.count({
        where: {
          createdAt: { gte: thisMonth },
          status: { not: "CANCELLED" },
        },
      }),

      // Monthly revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thisMonth },
          status: { not: "CANCELLED" },
        },
        _sum: { totalAmount: true },
      }),

      // Total customers
      prisma.user.count({
        where: { role: "USER" },
      }),

      // Total products
      prisma.product.count({
        where: { isActive: true },
      }),

      // Pending orders
      prisma.order.count({
        where: { status: "PENDING" },
      }),

      // Low stock products
      prisma.$queryRaw<LowStockProduct[]>`
        SELECT p.id, p.name, SUM(pv.stockQuantity) as totalStock
        FROM products p
        JOIN product_variants pv ON pv.productId = p.id
        WHERE p.isActive = true AND pv.isActive = true
        GROUP BY p.id, p.name
        HAVING totalStock <= 10
        ORDER BY totalStock ASC
        LIMIT 5
      `,

      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true } },
        },
      }),
    ]);

    const dashboardData = {
      stats: {
        today: {
          orders: todayOrders,
          revenue: Number(todayRevenue._sum.totalAmount || 0),
        },
        weekly: {
          orders: weeklyOrders,
          revenue: Number(weeklyRevenue._sum.totalAmount || 0),
        },
        monthly: {
          orders: monthlyOrders,
          revenue: Number(monthlyRevenue._sum.totalAmount || 0),
        },
        totals: {
          customers: totalCustomers,
          products: totalProducts,
          pendingOrders,
        },
      },
      lowStockProducts: lowStockProducts.map((item) => ({
        ...item,
        totalStock: Number(item.totalStock),
      })),
      recentOrders: recentOrders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      })),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}