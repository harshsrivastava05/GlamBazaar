import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/search - Global search across products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "relevance";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    const where = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
        { brand: { contains: query, mode: "insensitive" as const } },
        { tags: { contains: query, mode: "insensitive" as const } },
      ],
      ...(category && {
        category: {
          slug: category,
        },
      }),
      ...(minPrice && {
        basePrice: {
          gte: parseFloat(minPrice),
        },
      }),
      ...(maxPrice && {
        basePrice: {
          lte: parseFloat(maxPrice),
        },
      }),
    };

    let orderBy = {};
    switch (sortBy) {
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "rating":
        orderBy = { averageRating: "desc" };
        break;
      default:
        orderBy = { name: "asc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, altText: true },
          },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((product) => ({
      ...product,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      reviewCount: product._count.reviews,
      _count: undefined,
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
      query,
      filters: {
        category,
        minPrice,
        maxPrice,
        sortBy,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
