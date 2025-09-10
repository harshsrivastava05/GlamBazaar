import { prisma } from "./client";

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
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw new Error("Failed to fetch cart items");
  }
}

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
    console.error("Error adding to cart:", error);
    throw new Error("Failed to add item to cart");
  }
}

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
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw new Error("Failed to update cart item");
  }
}

export async function removeCartItem(cartItemId: number) {
  try {
    return await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw new Error("Failed to remove cart item");
  }
}

export async function clearCart(userId: string) {
  try {
    return await prisma.cartItem.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
}

export async function getCartItemCount(userId: string): Promise<number> {
  try {
    const result = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}

export async function isProductInCart(
  userId: string,
  productId: number,
  variantId?: number
): Promise<boolean> {
  try {
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        variantId: variantId || null,
      },
    });
    return !!cartItem;
  } catch (error) {
    console.error("Error checking cart item:", error);
    return false;
  }
}