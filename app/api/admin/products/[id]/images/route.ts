// app/api/admin/products/[id]/images/route.ts
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
    const { url, altText } = data

    if (!url?.trim()) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Get current max sort order
    const maxSortOrder = await prisma.productImage.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    })

    const sortOrder = (maxSortOrder._max.sortOrder || -1) + 1

    const image = await prisma.productImage.create({
      data: {
        productId,
        url: url.trim(),
        altText: altText?.trim() || null,
        isPrimary: sortOrder === 0, // First image is primary
        sortOrder,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error("Create image error:", error)
    return NextResponse.json({ error: "Failed to create image" }, { status: 500 })
  }
}

// app/api/admin/products/[id]/images/[imageId]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, imageId } = await params
    const productId = parseInt(id)
    const imageIdInt = parseInt(imageId)
    
    if (isNaN(productId) || isNaN(imageIdInt)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    // Check if image exists and belongs to product
    const image = await prisma.productImage.findFirst({
      where: { id: imageIdInt, productId },
    })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Don't allow deletion if it's the only image
    const imageCount = await prisma.productImage.count({
      where: { productId },
    })

    if (imageCount === 1) {
      return NextResponse.json(
        { error: "Cannot delete the last image" },
        { status: 400 }
      )
    }

    await prisma.productImage.delete({
      where: { id: imageIdInt },
    })

    // If deleted image was primary, make first remaining image primary
    if (image.isPrimary) {
      const firstImage = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: "asc" },
      })

      if (firstImage) {
        await prisma.productImage.update({
          where: { id: firstImage.id },
          data: { isPrimary: true },
        })
      }
    }

    return NextResponse.json({ message: "Image deleted successfully" })
  } catch (error) {
    console.error("Delete image error:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}