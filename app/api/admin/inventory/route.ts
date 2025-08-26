import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/inventory - Get inventory overview
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get("lowStock") === "true";
    const outOfStock = searchParams.get("outOfStock") === "true";

    let stockQuery = "";
    if (lowStock) {
      stockQuery = "HAVING totalStock > 0 AND totalStock <= 10";
    } else if (outOfStock) {
      stockQuery = "HAVING totalStock = 0";
    }

    const inventory = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.basePrice,
        p.isActive,
        c.name as categoryName,
        SUM(pv.stockQuantity) as totalStock,
        COUNT(pv.id) as variantCount,
        MIN(pv.stockQuantity) as minStock,
        MAX(pv.stockQuantity) as maxStock
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN product_variants pv ON pv.productId = p.id AND pv.isActive = true
      WHERE p.isActive = true
      GROUP BY p.id, p.name, p.basePrice, p.isActive, c.name
      ${stockQuery ? stockQuery : ""}
      ORDER BY totalStock ASC, p.name ASC
    `;

    const formattedInventory = (inventory as any[]).map((item) => ({
      ...item,
      basePrice: Number(item.basePrice),
      totalStock: Number(item.totalStock || 0),
      variantCount: Number(item.variantCount),
      minStock: Number(item.minStock || 0),
      maxStock: Number(item.maxStock || 0),
    }));

    return NextResponse.json({
      inventory: formattedInventory,
      summary: {
        totalProducts: formattedInventory.length,
        lowStockProducts: formattedInventory.filter(
          (item) => item.totalStock > 0 && item.totalStock <= 10
        ).length,
        outOfStockProducts: formattedInventory.filter(
          (item) => item.totalStock === 0
        ).length,
        totalStock: formattedInventory.reduce(
          (sum, item) => sum + item.totalStock,
          0
        ),
      },
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory data" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/inventory - Bulk update stock
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { updates } = data; // Array of { variantId, stockQuantity }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 }
      );
    }

    const updatePromises = updates.map((update: any) =>
      prisma.productVariant.update({
        where: { id: update.variantId },
        data: { stockQuantity: update.stockQuantity },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Successfully updated ${updates.length} variants`,
      updatedCount: updates.length,
    });
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
