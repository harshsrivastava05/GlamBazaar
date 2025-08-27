"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Star, ShoppingCart, Package } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { useWishlist } from "@/hooks/use-wishlist";
import { addToCartWithUpdate } from "@/utils/cart";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { data: session } = useSession();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  
  // Calculate average rating
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  // Calculate total stock
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  
  // Determine price display
  const currentPrice = product.salePrice || product.basePrice;
  const hasDiscount = !!product.salePrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  // Check if product has variants with different prices
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const hasVariantPricing = minPrice !== maxPrice;
  const priceDisplay = hasVariantPricing
    ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
    : formatPrice(currentPrice);

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsTogglingWishlist(true);
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (totalStock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await addToCartWithUpdate(
        product.id, 
        product.variants.length > 0 ? product.variants[0].id : undefined, 
        1
      );

      if (response.ok) {
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart`,
          variant: "success",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while adding to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card className={`group cursor-pointer card-shadow overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <Badge variant="secondary" className="text-xs font-medium">
                Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs font-medium">
                -{discountPercentage}%
              </Badge>
            )}
            {totalStock < 5 && totalStock > 0 && (
              <Badge variant="outline" className="text-xs bg-background/80">
                Low Stock
              </Badge>
            )}
            {totalStock === 0 && (
              <Badge variant="outline" className="text-xs bg-background/80 text-red-600">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 hover:bg-background h-8 w-8 ${
              inWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
            }`}
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
          >
            {isTogglingWishlist ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            )}
            <span className="sr-only">
              {inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            </span>
          </Button>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              className="w-full text-xs"
              disabled={totalStock === 0 || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <>
                  <div className="mr-2 h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 mr-2" />
                  {totalStock === 0 ? "Out of Stock" : "Quick Add"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <Link href={`/products/${product.slug}`}>
          <div className="space-y-2">
            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {product.brand}
              </p>
            )}

            {/* Product Name */}
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviews.length})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">{priceDisplay}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>

            {/* Stock Info */}
            {totalStock > 0 && totalStock < 5 && (
              <p className="text-xs text-orange-600 font-medium">
                Only {totalStock} left in stock
              </p>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}