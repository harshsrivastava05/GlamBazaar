"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/app/components/ui/use-toast";

interface WishlistItem {
  id: number;
  userId: string;
  productId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
    basePrice: number;
    salePrice?: number;
    isActive: boolean;
    images: Array<{
      id: number;
      url: string;
      altText: string;
    }>;
  };
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      refreshWishlist();
    } else if (status === "unauthenticated") {
      setWishlistItems([]);
    }
  }, [session, status]);

  const refreshWishlist = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  const addToWishlist = async (productId: number): Promise<boolean> => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setWishlistItems((prev) => {
          // Check if item already exists to avoid duplicates
          const exists = prev.some((item) => item.productId === productId);
          if (exists) return prev;
          return [newItem, ...prev];
        });

        toast({
          title: "Added to Wishlist",
          description: "Item has been added to your wishlist",
          variant: "success",
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to add item to wishlist",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: number): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.productId !== productId)
        );

        toast({
          title: "Removed from Wishlist",
          description: "Item has been removed from your wishlist",
          variant: "success",
        });
        return true;
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to remove item from wishlist",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist,
    loading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

// Optional: Wishlist heart button component for easy reuse
export function WishlistButton({
  productId,
  className = "",
  showText = false,
  size = "default",
}: {
  productId: number;
  className?: string;
  showText?: boolean;
  size?: "sm" | "default" | "lg";
}) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const inWishlist = isInWishlist(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsToggling(true);
    await toggleWishlist(productId);
    setIsToggling(false);
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`
        inline-flex items-center justify-center rounded-full transition-all duration-200
        ${
          inWishlist
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-red-500"
        }
        ${isToggling ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}
        ${className}
      `}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isToggling ? (
        <div
          className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}
        />
      ) : (
        <svg
          className={sizeClasses[size]}
          fill={inWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
      {showText && (
        <span className="ml-2 text-sm">{inWishlist ? "Saved" : "Save"}</span>
      )}
    </button>
  );
}
