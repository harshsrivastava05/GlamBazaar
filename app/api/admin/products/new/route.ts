import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
      images = [],        // [{ url, altText? }]
      variants = [],      // optional [{ sku?, price?, stockQuantity?, isActive? }]
      featured = false,
      isActive = true,
    } = data

    if (!name || !categoryId || basePrice == null) {
      return NextResponse.json({ error: 'name, categoryId, basePrice are required' }, { status: 400 })
    }

    // unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    let slug = baseSlug
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) slug = `${baseSlug}-${Date.now()}`

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        categoryId,
        brand,
        basePrice,
        salePrice,
        featured,
        isActive,
        tags,
        images: images.length
          ? {
              create: images.map((img: any, index: number) => ({
                url: img.url,
                altText: img.altText || name,
                isPrimary: index === 0,
                sortOrder: index,
              })),
            }
          : undefined,
        variants:
          variants.length > 0
            ? {
                create: variants.map((v: any, i: number) => ({
                  sku: (v.sku || `${slug}-VAR-${i + 1}`).toUpperCase(),
                  price: v.price ?? basePrice,
                  stockQuantity: v.stockQuantity ?? 0,
                  isActive: v.isActive ?? true,
                })),
              }
            : {
                create: {
                  sku: `${slug}-DEFAULT`.toUpperCase(),
                  price: basePrice,
                  stockQuantity,
                  isActive: true,
                },
              },
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('admin products new error', e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
