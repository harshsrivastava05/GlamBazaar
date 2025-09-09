import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    const where = {
      role: UserRole.USER,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          image: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              addresses: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate total spent for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const totalSpent = await prisma.order.aggregate({
          where: {
            userId: customer.id,
            paymentStatus: "PAID",
          },
          _sum: { totalAmount: true },
        });

        return {
          ...customer,
          orderCount: customer._count.orders,
          reviewCount: customer._count.reviews,
          addressCount: customer._count.addresses,
          totalSpent: Number(totalSpent._sum.totalAmount || 0),
          createdAt: customer.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < limit,
      },
    });
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}