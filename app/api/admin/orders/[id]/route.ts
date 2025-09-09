// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: { url: true, altText: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                variantAttributes: {
                  include: {
                    attribute: { select: { name: true, displayName: true } },
                    attributeOption: {
                      select: { value: true, displayValue: true },
                    },
                  },
                },
              },
            },
          },
        },
        address: true,
        transactions: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const formattedOrder = {
      ...order,
      totalAmount: Number(order.totalAmount),
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const data = await request.json();
    const { status, paymentStatus, trackingNumber } = data;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined)
      updateData.trackingNumber = trackingNumber;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Order updated successfully",
      order: {
        ...order,
        totalAmount: Number(order.totalAmount),
      },
    });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Only allow deletion of cancelled orders
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Only cancelled orders can be deleted" },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Order deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}