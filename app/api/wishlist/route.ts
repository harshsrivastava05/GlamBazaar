import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { productId } = await request.json()

  try {
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        productId: productId
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to add to wishlist' }, { status: 500 })
  }
}