import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateCartItem, removeCartItem, getCartItems } from '@/lib/db'
import { prisma } from '@/lib/db'

// PUT /api/cart/[id] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { id } = await params
    const cartItemId = parseInt(id)
    if (isNaN(cartItemId)) {
      return NextResponse.json(
        { error: 'Invalid cart item ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { quantity } = body

    // Validate quantity
    if (!quantity || quantity <= 0 || quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Check if cart item exists and belongs to user
    const existingCartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: true,
        variant: true
      }
    })

    if (!existingCartItem || existingCartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Check stock availability
    const availableStock = existingCartItem.variant?.stockQuantity || 0
    if (availableStock < quantity) {
      return NextResponse.json(
        { error: `Only ${availableStock} items available in stock` },
        { status: 400 }
      )
    }

    // Update cart item
    const updatedCartItem = await updateCartItem(cartItemId, quantity)
    
    // Get updated cart summary
    const cartItems = await getCartItems(session.user.id)
    const summary = {
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartItems.reduce((sum, item) => {
        const price = item.variant?.price || item.product?.basePrice || 0
        return sum + (Number(price) * item.quantity)
      }, 0),
      itemCount: cartItems.length
    }

    return NextResponse.json({
      message: 'Cart item updated successfully',
      cartItem: updatedCartItem,
      summary
    })

  } catch (error) {
    console.error('Cart PUT Error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { id } = await params
    const cartItemId = parseInt(id)
    if (isNaN(cartItemId)) {
      return NextResponse.json(
        { error: 'Invalid cart item ID' },
        { status: 400 }
      )
    }

    // Check if cart item exists and belongs to user
    const existingCartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    })

    if (!existingCartItem || existingCartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Remove cart item
    await removeCartItem(cartItemId)
    
    // Get updated cart summary
    const cartItems = await getCartItems(session.user.id)
    const summary = {
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartItems.reduce((sum, item) => {
        const price = item.variant?.price || item.product?.basePrice || 0
        return sum + (Number(price) * item.quantity)
      }, 0),
      itemCount: cartItems.length
    }

    return NextResponse.json({
      message: 'Item removed from cart successfully',
      summary
    })

  } catch (error) {
    console.error('Cart DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
}