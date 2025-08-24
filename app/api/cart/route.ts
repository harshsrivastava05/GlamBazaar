import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addToCart } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, variantId, quantity } = body

    // Add validation
    if (!productId || typeof productId !== 'number') {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 })
    }

    if (quantity && (typeof quantity !== 'number' || quantity < 1)) {
      return NextResponse.json({ message: 'Invalid quantity' }, { status: 400 })
    }

    await addToCart(session.user.id, productId, variantId, quantity || 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart API Error:', error)
    return NextResponse.json({ message: 'Failed to add to cart' }, { status: 500 })
  }
}