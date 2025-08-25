import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
          variant: { select: { id: true, sku: true } },
        },
      },
    },
  })
  return NextResponse.json(orders)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await request.json()
  // Basic validation
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  }
  // Create order (assumes pricing already calculated on client or separate service)
  const orderNumber = `GB${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  const order = await prisma.order.create({
    data: {
      userId: session.user.id as string,
      orderNumber,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: data.paymentMethod ?? 'COD',
      subtotal: data.subtotal ?? 0,
      taxAmount: data.taxAmount ?? 0,
      shippingAmount: data.shippingAmount ?? 0,
      discountAmount: data.discountAmount ?? 0,
      totalAmount: data.totalAmount ?? 0,
      currency: 'INR',
      shippingName: data.shippingName,
      shippingPhone: data.shippingPhone,
      shippingAddressLine1: data.shippingAddressLine1,
      shippingAddressLine2: data.shippingAddressLine2,
      shippingCity: data.shippingCity,
      shippingState: data.shippingState,
      shippingPostalCode: data.shippingPostalCode,
      shippingCountry: data.shippingCountry ?? 'India',
      deliveryType: data.deliveryType ?? 'SPEEDPOST',
      items: {
        create: data.items.map((it: any) => ({
          productId: it.productId,
          variantId: it.variantId ?? null,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.unitPrice * it.quantity,
        })),
      },
    },
    include: { items: true },
  })
  return NextResponse.json(order, { status: 201 })
}
