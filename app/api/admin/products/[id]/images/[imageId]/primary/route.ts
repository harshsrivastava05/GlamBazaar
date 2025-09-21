import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(
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

    // Update all images for this product to not be primary
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    })

    // Set the specified image as primary
    const updatedImage = await prisma.productImage.update({
      where: { id: imageIdInt },
      data: { isPrimary: true },
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error("Set primary image error:", error)
    return NextResponse.json({ error: "Failed to set primary image" }, { status: 500 })
  }
}