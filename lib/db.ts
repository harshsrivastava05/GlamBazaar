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
    ...(options?.minPrice && { basePrice: { gte: options.minPrice } }),
    ...(options?.maxPrice && { basePrice: { lte: options.maxPrice } }),
    ...(options?.brands && options.brands.length > 0 && { brand: { in: options.brands } }),
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
  try {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            isActive: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                id: true,
                url: true,
                altText: true,
              },
            },
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            price: true,
            stockQuantity: true,
            isActive: true,
            variantAttributes: {
              include: {
                attribute: {
                  select: {
                    id: true,
                    name: true,
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
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching cart items:', error)
    throw new Error('Failed to fetch cart items')
  }
}

// Enhanced addToCart with upsert logic
export async function addToCart(
  userId: string, 
  productId: number, 
  variantId?: number, 
  quantity: number = 1
) {
  try {
    // First, check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingCartItem) {
      // Update existing item by adding to quantity
      return await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
          updatedAt: new Date(),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              basePrice: true,
            },
          },
          variant: {
            select: {
              id: true,
              sku: true,
              price: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      return await prisma.cartItem.create({
        data: {
          userId,
          productId,
          variantId: variantId || null,
          quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              basePrice: true,
            },
          },
          variant: {
            select: {
              id: true,
              sku: true,
              price: true,
            },
          },
        },
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw new Error('Failed to add item to cart')
  }
}

// Update cart item quantity
export async function updateCartItem(cartItemId: number, quantity: number) {
  try {
    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { 
        quantity,
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            price: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    throw new Error('Failed to update cart item')
  }
}

// Remove single cart item
export async function removeCartItem(cartItemId: number) {
  try {
    return await prisma.cartItem.delete({
      where: { id: cartItemId },
    })
  } catch (error) {
    console.error('Error removing cart item:', error)
    throw new Error('Failed to remove cart item')
  }
}

// Clear entire user cart
export async function clearCart(userId: string) {
  try {
    return await prisma.cartItem.deleteMany({
      where: { userId },
    })
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw new Error('Failed to clear cart')
  }
}

// Get cart item count
export async function getCartItemCount(userId: string): Promise<number> {
  try {
    const result = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    })
    return result._sum.quantity || 0
  } catch (error) {
    console.error('Error getting cart count:', error)
    return 0
  }
}
// Check if product is in cart
export async function isProductInCart(
  userId: string, 
  productId: number, 
  variantId?: number
): Promise<boolean> {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: variantId || null,
        },
      },
    })
    return !!cartItem
  } catch (error) {
    console.error('Error checking cart item:', error)
    return false
  }
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