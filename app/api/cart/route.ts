import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addToCart } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { productId, variantId, quantity } = await request.json()

  try {
    await addToCart(session.user.id, productId, variantId, quantity)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to add to cart' }, { status: 500 })
  }
}