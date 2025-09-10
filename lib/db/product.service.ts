import { Product } from "../types";
import { prisma } from "./client";

export async function getProducts(options?: {
  featured?: boolean;
  categoryId?: number;
  categoryIds?: number[];
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: "name" | "price" | "created";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
}): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isActive: true,
    ...(options?.featured && { featured: true }),
    ...(options?.categoryId && { categoryId: options.categoryId }),
    ...(options?.categoryIds && { categoryId: { in: options.categoryIds } }),
    ...(options?.search && {
      OR: [
        { name: { contains: options.search, mode: "insensitive" as const } },
        {
          description: {
            contains: options.search,
            mode: "insensitive" as const,
          },
        },
        { brand: { contains: options.search, mode: "insensitive" as const } },
      ],
    }),
    ...(options?.brands &&
      options.brands.length > 0 && { brand: { in: options.brands } }),
  };

  // Handle price range filter (both min and max)
  if (options?.minPrice && options?.maxPrice) {
    where.basePrice = {
      gte: options.minPrice,
      lte: options.maxPrice,
    };
  } else if (options?.minPrice) {
    where.basePrice = { gte: options.minPrice };
  } else if (options?.maxPrice) {
    where.basePrice = { lte: options.maxPrice };
  }

  const orderBy = (() => {
    switch (options?.sortBy) {
      case "name":
        return { name: options.sortOrder || "asc" };
      case "price":
        return { basePrice: options.sortOrder || "asc" };
      case "created":
        return { createdAt: options.sortOrder || "desc" };
      default:
        return { createdAt: "desc" as const };
    }
  })();

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          parentId: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          url: true,
          altText: true,
          isPrimary: true,
          sortOrder: true,
        },
      },
      variants: {
        where: { isActive: true },
        include: {
          variantAttributes: {
            include: {
              attribute: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  displayName: true,
                },
              },
              attributeOption: {
                select: {
                  id: true,
                  value: true,
                  displayValue: true,
                  colorHex: true,
                },
              },
            },
          },
        },
      },
      reviews: {
        where: { isApproved: true },
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          isApproved: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        take: 5, // Limit reviews for performance
      },
    },
    orderBy,
    ...(options?.limit && { take: options.limit }),
    ...(options?.offset && { skip: options.offset }),
  });

  // Transform to match Product interface
  return products.map((product) => ({
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    reviewCount: product.reviews.length,
    images: product.images.map((img) => ({
      ...img,
      altText: img.altText || `${product.name} image`,
      alt: img.altText || `${product.name} image`,
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined,
    })),
    reviews: product.reviews.map((review) => ({
      ...review,
      title: review.title ?? undefined,
      content: review.content ?? undefined,
      comment: review.content ?? undefined, // Backward compatibility
      createdAt: review.createdAt.toISOString(),
    })),
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          parentId: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        where: { isActive: true },
        include: {
          variantAttributes: {
            include: {
              attribute: true,
              attributeOption: true,
            },
          },
        },
      },
      reviews: {
        where: { isApproved: true },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    reviewCount: product.reviews.length,
    images: product.images.map((img) => ({
      ...img,
      altText: img.altText || `${product.name} image`,
      alt: img.altText || `${product.name} image`,
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined,
    })),
    reviews: product.reviews.map((review) => ({
      ...review,
      title: review.title ?? undefined,
      content: review.content ?? undefined,
      comment: review.content ?? undefined, // Backward compatibility
      createdAt: review.createdAt.toISOString(),
    })),
  };
}