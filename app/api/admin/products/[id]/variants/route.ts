// app/api/admin/products/[id]/variants/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const data = await request.json()
    const { sku, price, stockQuantity, isActive } = data

    if (!sku?.trim()) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 })
    }

    if (!price || isNaN(parseFloat(price))) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 })
    }

    if (stockQuantity === undefined || isNaN(parseInt(stockQuantity))) {
      return NextResponse.json({ error: "Valid stock quantity is required" }, { status: 400 })
    }

    // Check if SKU already exists for this product
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId,
        sku: sku.trim().toUpperCase(),
      },
    })

    if (existingVariant) {
      return NextResponse.json(
        { error: "SKU already exists for this product" },
        { status: 400 }
      )
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku: sku.trim().toUpperCase(),
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    console.error("Create variant error:", error)
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 })
  }
}

// app/api/admin/products/[id]/variants/[variantId]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, variantId } = await params
    const productId = parseInt(id)
    const variantIdInt = parseInt(variantId)
    
    if (isNaN(productId) || isNaN(variantIdInt)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    const data = await request.json()
    const { sku, price, stockQuantity, isActive } = data

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    
    if (sku !== undefined) {
      if (!sku.trim()) {
        return NextResponse.json({ error: "SKU cannot be empty" }, { status: 400 })
      }
      
      // Check if SKU already exists for this product (excluding current variant)
      const existingVariant = await prisma.productVariant.findFirst({
        where: {
          productId,
          sku: sku.trim().toUpperCase(),
          id: { not: variantIdInt },
        },
      })

      if (existingVariant) {
        return NextResponse.json(
          { error: "SKU already exists for this product" },
          { status: 400 }
        )
      }
      
      updateData.sku = sku.trim().toUpperCase()
    }
    
    if (price !== undefined) {
      if (isNaN(parseFloat(price))) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 })
      }
      updateData.price = parseFloat(price)
    }
    
    if (stockQuantity !== undefined) {
      if (isNaN(parseInt(stockQuantity))) {
        return NextResponse.json({ error: "Invalid stock quantity" }, { status: 400 })
      }
      updateData.stockQuantity = parseInt(stockQuantity)
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const variant = await prisma.productVariant.update({
      where: { 
        id: variantIdInt,
        productId, // Ensure variant belongs to product
      },
      data: updateData,
    })

    return NextResponse.json(variant)
  } catch (error) {
    console.error("Update variant error:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, variantId } = await params
    const productId = parseInt(id)
    const variantIdInt = parseInt(variantId)
    
    if (isNaN(productId) || isNaN(variantIdInt)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    // Check if this is the last variant
    const variantCount = await prisma.productVariant.count({
      where: { productId },
    })

    if (variantCount === 1) {
      return NextResponse.json(
        { error: "Cannot delete the last variant" },
        { status: 400 }
      )
    }

    // Check if variant has orders
    const orderCount = await prisma.orderItem.count({
      where: {
        productId,
        variantId: variantIdInt,
      },
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete variant with existing orders" },
        { status: 400 }
      )
    }

    await prisma.productVariant.delete({
      where: { 
        id: variantIdInt,
        productId, // Ensure variant belongs to product
      },
    })

    return NextResponse.json({ message: "Variant deleted successfully" })
  } catch (error) {
    console.error("Delete variant error:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 })
  }
}