import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = params.userId;
  const customer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      role: true,
      createdAt: true,
      addresses: {
        select: {
          id: true,
          fullName: true,
          addressLine1: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          isDefault: true,
        },
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          title: true,
          createdAt: true,
          product: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
          items: { select: { quantity: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { orders: true, reviews: true, addresses: true } },
    },
  });

  if (!customer)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalSpent = customer.orders.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0
  );
  const averageOrderValue =
    customer._count.orders > 0 ? totalSpent / customer._count.orders : 0;

  return NextResponse.json({
    ...customer,
    totalSpent,
    averageOrderValue,
    orders: customer.orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      itemCount: o.items.reduce((s, it) => s + it.quantity, 0),
    })),
  });
}
