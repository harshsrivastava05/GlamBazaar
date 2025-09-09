import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

// GET /api/reviews - Get reviews with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating')

    const offset = (page - 1) * limit

    const where = {
      ...(productId && { productId: parseInt(productId) }),
      ...(userId && { userId }),
      ...(rating && { rating: parseInt(rating) }),
      isApproved: true
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { productId, rating, title } = data

    // Validate input
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Product ID and rating (1-5) are required' },
        { status: 400 }
      )
    }

    // Check if user has purchased this product
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id as string,
          status: OrderStatus.DELIVERED
        }
      }
    })

    if (!hasOrdered) {
      return NextResponse.json(
        { error: 'You can only review products you have purchased' },
        { status: 403 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id as string,
          productId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id as string,
        productId,
        rating,
        title: title || null,
        isApproved: true // Auto-approve for now
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}