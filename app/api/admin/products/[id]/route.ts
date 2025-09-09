import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/products/[id] - Get single product details
export async function GET(
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

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          include: {
            variantAttributes: {
              include: {
                attribute: { select: { name: true, displayName: true } },
                attributeOption: {
                  select: { value: true, displayValue: true },
                },
              },
            },
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formattedProduct = {
      ...product,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      totalStock: product.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
      reviewCount: product._count.reviews,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
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

    const data = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    // Only update provided fields
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.salePrice !== undefined) updateData.salePrice = data.salePrice;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined)
      updateData.metaDescription = data.metaDescription;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        _count: { select: { reviews: true } },
      },
    });

    const formattedProduct = {
      ...updatedProduct,
      basePrice: Number(updatedProduct.basePrice),
      salePrice: updatedProduct.salePrice
        ? Number(updatedProduct.salePrice)
        : null,
      reviewCount: updatedProduct._count.reviews,
    };

    return NextResponse.json({
      message: "Product updated successfully",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete product with existing orders. Consider deactivating instead.",
        },
        { status: 400 }
      );
    }

    // Delete related data in correct order
    await prisma.$transaction(async (tx) => {
      // Delete variant attributes first
      await tx.variantAttribute.deleteMany({
        where: {
          variant: {
            productId,
          },
        },
      });

      // Delete variants
      await tx.productVariant.deleteMany({
        where: { productId },
      });

      // Delete reviews
      await tx.review.deleteMany({
        where: { productId },
      });

      // Delete wishlist items
      await tx.wishlistItem.deleteMany({
        where: { productId },
      });

      // Delete cart items
      await tx.cartItem.deleteMany({
        where: { productId },
      });

      // Delete images
      await tx.productImage.deleteMany({
        where: { productId },
      });

      // Finally delete the product
      await tx.product.delete({
        where: { id: productId },
      });
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}