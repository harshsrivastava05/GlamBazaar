import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCartItems, addToCart, clearCart } from '@/lib/db'
import { prisma } from '@/lib/db'

// GET /api/cart - Get user's cart items
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const cartItems = await getCartItems(session.user.id)
    
    // Calculate cart summary
    const summary = {
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartItems.reduce((sum, item) => {
        const price = item.variant?.price || item.product?.basePrice || 0
        return sum + (Number(price) * item.quantity)
      }, 0),
      itemCount: cartItems.length
    }

    return NextResponse.json({
      items: cartItems,
      summary
    })
  } catch (error) {
    console.error('Cart GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart items' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body

    // Validate input
    if (!productId || typeof productId !== 'number') {
      return NextResponse.json(
        { error: 'Product ID is required and must be a number' },
        { status: 400 }
      )
    }

    if (quantity <= 0 || quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      include: {
        variants: {
          where: { 
            ...(variantId && { id: variantId }),
            isActive: true 
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }

    // If variant specified, check if it exists and has stock
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId)
      if (!variant) {
        return NextResponse.json(
          { error: 'Product variant not found' },
          { status: 404 }
        )
      }
      
      if (variant.stockQuantity < quantity) {
        return NextResponse.json(
          { error: `Only ${variant.stockQuantity} items available in stock` },
          { status: 400 }
        )
      }
    }

    // Add to cart
    const cartItem = await addToCart(session.user.id, productId, variantId, quantity)
    
    // Get updated cart items for response
    const updatedCartItems = await getCartItems(session.user.id)
    const summary = {
      totalItems: updatedCartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: updatedCartItems.reduce((sum, item) => {
        const price = item.variant?.price || item.product?.basePrice || 0
        return sum + (Number(price) * item.quantity)
      }, 0),
      itemCount: updatedCartItems.length
    }

    return NextResponse.json({
      message: 'Item added to cart successfully',
      cartItem,
      summary
    }, { status: 201 })

  } catch (error) {
    console.error('Cart POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Clear entire cart
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    await clearCart(session.user.id)

    return NextResponse.json({
      message: 'Cart cleared successfully'
    })
  } catch (error) {
    console.error('Cart DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}