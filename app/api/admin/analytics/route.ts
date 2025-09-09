import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface SalesChartData {
  date: Date;
  orders: number;
  revenue: number;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get("period") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders,
      recentOrders,
      topProducts,
      salesChart,
      previousPeriodOrders,
      previousPeriodRevenue,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        take: 10,
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: { createdAt: { gte: startDate } },
        },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
      }),
      // Sales chart data - group by day
      prisma.$queryRaw<SalesChartData[]>`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as orders,
          SUM(totalAmount) as revenue
        FROM orders 
        WHERE createdAt >= ${startDate} AND status != 'CANCELLED'
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
      // Previous period for growth calculation
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000),
            lt: startDate,
          },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000),
            lt: startDate,
          },
          status: { not: "CANCELLED" },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId as number },
          select: { name: true, basePrice: true },
        });
        return {
          productId: item.productId,
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: Number(item._sum.totalPrice || 0),
          product: product || { name: "Unknown Product", basePrice: 0 },
        };
      })
    );

    const ordersGrowth =
      previousPeriodOrders > 0
        ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100
        : 0;

    const revenueGrowth =
      ((previousPeriodRevenue._sum.totalAmount || 0) as number) > 0
        ? ((Number(totalRevenue._sum.totalAmount || 0) -
            Number(previousPeriodRevenue._sum.totalAmount || 0)) /
            Number(previousPeriodRevenue._sum.totalAmount || 0)) *
          100
        : 0;

    return NextResponse.json({
      overview: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
        totalCustomers,
        totalProducts,
        pendingOrders,
        ordersGrowth,
        revenueGrowth,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: Number(order.totalAmount),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        user: order.user,
      })),
      topProducts: topProductsWithDetails,
      salesChart: salesChart.map((item) => ({
        date: item.date,
        orders: Number(item.orders),
        revenue: Number(item.revenue),
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}