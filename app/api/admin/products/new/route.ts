import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check authentication and authorization
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const {
      name,
      description = '',
      shortDescription = '',
      categoryId,
      brand = '',
      basePrice,
      salePrice,
      stockQuantity = 0,
      tags,
      images = [],
      variants = [],
      featured = false,
      isActive = true,
    } = data

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    if (!basePrice || isNaN(parseFloat(basePrice))) {
      return NextResponse.json({ error: 'Valid base price is required' }, { status: 400 })
    }

    // Validate category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    })
    
    if (!categoryExists) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Generate unique slug
    const generateSlug = (text: string) => text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = generateSlug(name)
    const existingProduct = await prisma.product.findUnique({ where: { slug } })
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`
    }

    // Validate and process images
    const validImages = images.filter((img: any) => img.url && img.url.trim())

    // Create product with transaction
    const created = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          shortDescription: shortDescription?.trim() || null,
          categoryId: parseInt(categoryId),
          brand: brand?.trim() || null,
          basePrice: parseFloat(basePrice),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          featured,
          isActive,
          tags: tags?.trim() || null,
        }
      })

      // Create images if provided
      if (validImages.length > 0) {
        await tx.productImage.createMany({
          data: validImages.map((img: any, index: number) => ({
            productId: product.id,
            url: img.url.trim(),
            altText: img.altText?.trim() || product.name,
            isPrimary: index === 0,
            sortOrder: index,
          }))
        })
      }

      // Create variants
      if (variants.length > 0) {
        // Create custom variants
        const variantData = variants.map((variant: any, index: number) => ({
          productId: product.id,
          sku: variant.sku?.trim().toUpperCase() || `${slug.toUpperCase()}-VAR-${index + 1}`,
          price: variant.price ? parseFloat(variant.price) : parseFloat(basePrice),
          stockQuantity: variant.stockQuantity ? parseInt(variant.stockQuantity) : 0,
          isActive: variant.isActive !== false,
        }))

        await tx.productVariant.createMany({
          data: variantData
        })
      } else {
        // Create default variant
        await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: `${slug.toUpperCase()}-DEFAULT`,
            price: parseFloat(basePrice),
            stockQuantity: parseInt(stockQuantity) || 0,
            isActive: true,
          }
        })
      }

      return product
    })

    // Fetch the complete created product
    const completeProduct = await prisma.product.findUnique({
      where: { id: created.id },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        _count: { select: { reviews: true } }
      }
    })

    return NextResponse.json(completeProduct, { status: 201 })

  } catch (error: any) {
    console.error('Product creation error:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'A product with this name or SKU already exists' 
      }, { status: 400 })
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Invalid category reference' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || 'Failed to create product' 
    }, { status: 500 })
  }
}