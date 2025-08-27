// utils/cart.ts
export const updateGlobalCartCount = (newCount: number) => {
  // Update the header's cart count immediately
  if (typeof window !== "undefined" && (window as any).updateCartCount) {
    (window as any).updateCartCount(newCount);
  }

  // Trigger storage event for cross-tab synchronization
  if (typeof window !== "undefined") {
    localStorage.setItem("cart-updated", Date.now().toString());
  }
};

export const refreshCartCount = async () => {
  try {
    const response = await fetch("/api/cart/count", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (response.ok) {
      const data = await response.json();
      updateGlobalCartCount(data.count || 0);
      return data.count || 0;
    }
  } catch (error) {
    console.error("Failed to refresh cart count:", error);
  }
  return 0;
};

// Enhanced cart API calls with automatic count updates
export const addToCartWithUpdate = async (
  productId: number,
  variantId?: number,
  quantity: number = 1
) => {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, variantId, quantity }),
  });

  if (response.ok) {
    // Refresh cart count immediately after successful addition
    await refreshCartCount();
  }

  return response;
};

export const removeFromCartWithUpdate = async (cartItemId: number) => {
  const response = await fetch("/api/cart", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartItemId }),
  });

  if (response.ok) {
    // Refresh cart count immediately after successful removal
    await refreshCartCount();
  }

  return response;
};

export const updateCartItemWithUpdate = async (
  cartItemId: number,
  quantity: number
) => {
  const response = await fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartItemId, quantity }),
  });

  if (response.ok) {
    // Refresh cart count immediately after successful update
    await refreshCartCount();
  }

  return response;
};
