import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get('featured') === 'true'
    const categoryId = searchParams.get('categoryId') 
      ? parseInt(searchParams.get('categoryId')!) 
      : undefined
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : undefined
    const offset = searchParams.get('offset') 
      ? parseInt(searchParams.get('offset')!) 
      : undefined
    const search = searchParams.get('search') || undefined
    const sortBy = (searchParams.get('sortBy') as 'name' | 'price' | 'created') || 'created'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

    const products = await getProducts({
      featured,
      categoryId,
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}