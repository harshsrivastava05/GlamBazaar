import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id as string },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          salePrice: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { productId } = await request.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.user.id as string, productId } },
    update: {},
    create: { userId: session.user.id as string, productId },
  })
  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { productId } = await request.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
  await prisma.wishlistItem.delete({
    where: { userId_productId: { userId: session.user.id as string, productId } },
  })
  return NextResponse.json({ ok: true })
}
