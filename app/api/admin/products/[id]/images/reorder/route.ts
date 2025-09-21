import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Type definition for the request body
interface ImageReorderItem {
  id: number;
  sortOrder: number;
}

interface ReorderRequestBody {
  images: ImageReorderItem[];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const data: ReorderRequestBody = await request.json();
    const { images } = data;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: "Images array is required" },
        { status: 400 }
      );
    }

    // Validate image structure
    const isValidImages = images.every(
      (img): img is ImageReorderItem => 
        typeof img === 'object' && 
        typeof img.id === 'number' && 
        typeof img.sortOrder === 'number'
    );

    if (!isValidImages) {
      return NextResponse.json(
        { error: "Invalid image data structure" },
        { status: 400 }
      );
    }

    // Validate all images belong to the product
    const imageIds = images.map((img) => img.id);
    const existingImages = await prisma.productImage.findMany({
      where: {
        id: { in: imageIds },
        productId,
      },
    });

    if (existingImages.length !== images.length) {
      return NextResponse.json(
        { error: "Some images don't belong to this product" },
        { status: 400 }
      );
    }

    // Update sort orders using transaction
    await prisma.$transaction(
      images.map((img) =>
        prisma.productImage.update({
          where: { id: img.id },
          data: { sortOrder: img.sortOrder },
        })
      )
    );

    return NextResponse.json({ message: "Image order updated successfully" });
  } catch (error) {
    console.error("Reorder images error:", error);
    return NextResponse.json(
      { error: "Failed to reorder images" },
      { status: 500 }
    );
  }
}