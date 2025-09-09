"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useToast } from "@/app/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from "lucide-react";

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

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());

  const fetchWishlistItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      } else if (response.status === 401) {
        router.push("/login?callbackUrl=/wishlist");
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch wishlist items",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching your wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login?callbackUrl=/wishlist");
      return;
    }
    fetchWishlistItems();
  }, [session, status, router, fetchWishlistItems]);

  const removeFromWishlist = async (productId: number) => {
    setRemovingItems((prev) => new Set(prev).add(productId));
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
          title: "Success",
          description: "Item removed from wishlist",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const addToCart = async (productId: number) => {
    if (!session) {
      router.push("/login?callbackUrl=/wishlist");
      return;
    }

    setAddingToCart((prev) => new Set(prev).add(productId));
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item added to cart",
          variant: "success",
        });
        // Optionally remove from wishlist after adding to cart
        // removeFromWishlist(productId)
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to add item to cart",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setAddingToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const calculateDiscountPercentage = (
    basePrice: number,
    salePrice?: number
  ) => {
    if (!salePrice || salePrice >= basePrice) return 0;
    return Math.round(((basePrice - salePrice) / basePrice) * 100);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-8 flex-1 bg-muted rounded animate-pulse" />
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">My Wishlist</h1>
            </div>
            <p className="text-muted-foreground">
              {wishlistItems.length === 0
                ? "Your wishlist is empty"
                : `${wishlistItems.length} ${
                    wishlistItems.length === 1 ? "item" : "items"
                  } saved for later`}
            </p>
          </div>

          {/* Empty State */}
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Save items you love to your wishlist and come back to them
                later. Start exploring our products to find something special!
              </p>
              <Button asChild size="lg">
                <Link href="/products">
                  <Package className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                const discountPercentage = calculateDiscountPercentage(
                  item.product.basePrice,
                  item.product.salePrice
                );
                const finalPrice =
                  item.product.salePrice || item.product.basePrice;
                const isRemoving = removingItems.has(item.productId);
                const isAddingToCartState = addingToCart.has(item.productId);

                return (
                  <Card
                    key={item.id}
                    className="group overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <Link href={`/products/${item.product.slug}`}>
                          {item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.images[0].altText}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                        </Link>

                        {/* Discount Badge */}
                        {discountPercentage > 0 && (
                          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                            -{discountPercentage}%
                          </Badge>
                        )}

                        {/* Remove from wishlist button */}
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute top-3 right-3 h-8 w-8 bg-white/80 hover:bg-white border-0 shadow-sm"
                          onClick={() => removeFromWishlist(item.productId)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>

                        {/* Inactive Product Overlay */}
                        {!item.product.isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge
                              variant="secondary"
                              className="bg-white/90 text-black"
                            >
                              Unavailable
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-4 space-y-3">
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(finalPrice)}
                          </span>
                          {item.product.salePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(item.product.basePrice)}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => addToCart(item.productId)}
                            disabled={
                              !item.product.isActive || isAddingToCartState
                            }
                          >
                            {isAddingToCartState ? (
                              <>
                                <div className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                              </>
                            )}
                          </Button>

                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/products/${item.product.slug}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>

                        {/* Added Date */}
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Continue Shopping */}
          {wishlistItems.length > 0 && (
            <div className="text-center pt-8">
              <Button variant="outline" asChild size="lg">
                <Link href="/products">
                  <Package className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}