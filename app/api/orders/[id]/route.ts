import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id as string },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } } } },
          variant: true,
        },
      },
      transactions: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...order,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    shippingAmount: Number(order.shippingAmount),
    discountAmount: Number(order.discountAmount),
    totalAmount: Number(order.totalAmount),
    items: order.items.map(i => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
  })
}
