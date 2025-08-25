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
          product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
      transactions: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const body = await request.json()
  // Only allow status updates that make sense for the user (e.g., cancel)
  if (body.action === 'cancel') {
    const updated = await prisma.order.updateMany({
      where: { id, userId: session.user.id as string, status: { in: ['PENDING', 'CONFIRMED'] } },
      data: { status: 'CANCELLED' },
    })
    if (updated.count === 0) return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
}
