import { PrismaClient } from "@prisma/client";
import { Product } from "./types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Product queries
export async function getProducts(options?: {
  featured?: boolean;
  categoryId?: number;
  categoryIds?: number[];
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: "name" | "price" | "created";
  sortOrder?: "asc" | "desc";
}): Promise<Product[]> {
  const where = {
    isActive: true,
    ...(options?.featured && { featured: true }),
    ...(options?.categoryId && { categoryId: options.categoryId }),
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
  };

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
          comment: true,
          verifiedPurchase: true,
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

  // Transform to match Product interface - Fix all type issues
  return products.map((product) => ({
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : undefined, // Convert null to undefined
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images.map((img) => ({
      ...img,
      altText: img.altText || `${product.name} image`, // Ensure altText is always a string
      alt: img.altText || `${product.name} image`, // Add alt for compatibility with related-products component
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined, // Convert null to undefined
    })),
    reviews: product.reviews.map((review) => ({
      ...review,
      title: review.title ?? undefined, // Convert null to undefined
      comment: review.comment ?? undefined, // Convert null to undefined
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
    salePrice: product.salePrice ? Number(product.salePrice) : undefined, // Convert null to undefined
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images.map((img) => ({
      ...img,
      altText: img.altText || `${product.name} image`, // Ensure altText is always a string
      alt: img.altText || `${product.name} image`, // Add alt for compatibility with related-products component
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined, // Convert null to undefined
    })),
    reviews: product.reviews.map((review) => ({
      ...review,
      title: review.title ?? undefined, // Convert null to undefined
      comment: review.comment ?? undefined, // Convert null to undefined
      createdAt: review.createdAt.toISOString(),
    })),
  };
}

export async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
}) {
  return await prisma.user.create({
    data: userData,
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

// Cart functions
export async function getCartItems(userId: string) {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
      variant: {
        include: {
          variantAttributes: {
            include: {
              attribute: true,
              attributeOption: true,
            },
          },
        },
      },
    },
  });
}

// Fixed addToCart function to handle optional variantId properly
export async function addToCart(
  userId: string,
  productId: number,
  variantId: number | null = null, // Change to number | null and default to null
  quantity: number = 1
) {
  // Validate product exists and is active
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error("Product not found or inactive");
  }

  // If variantId provided, validate it exists
  if (variantId !== null) {
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: productId,
        isActive: true,
      },
    });

    if (!variant) {
      throw new Error("Variant not found or inactive");
    }
  }

  return await prisma.cartItem.upsert({
    where: {
      userId_productId_variantId: {
        userId,
        productId,
        variantId: variantId, // Now correctly typed as number | null
      },
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
    create: {
      userId,
      productId,
      variantId: variantId, // Now correctly typed as number | null
      quantity,
    },
  });
}

// Order functions
export async function createOrder(orderData: any) {
  return await prisma.order.create({
    data: orderData,
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
    },
  })
}

export async function getOrdersByUser(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          variant: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}