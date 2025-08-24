import { PrismaClient } from "@prisma/client";

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
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: "name" | "price" | "created";
  sortOrder?: "asc" | "desc";
}) {
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

  return await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
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
        select: {
          rating: true,
        },
      },
    },
    orderBy,
    ...(options?.limit && { take: options.limit }),
    ...(options?.offset && { skip: options.offset }),
  });
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
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

export async function addToCart(
  userId: string,
  productId: number,
  variantId?: number,
  quantity: number = 1
) {
  return await prisma.cartItem.upsert({
    where: {
      userId_productId_variantId: {
        userId,
        productId,
        variantId,
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
      variantId,
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
