"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0
  );
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const priceDisplay =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  return (
    <Card
      className={`group cursor-pointer card-shadow overflow-hidden ${className}`}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
            {product.salePrice && (
              <Badge variant="destructive" className="text-xs">
                Sale
              </Badge>
            )}
            {totalStock < 5 && totalStock > 0 && (
              <Badge variant="outline" className="text-xs bg-background/80">
                Low Stock
              </Badge>
            )}
            {totalStock === 0 && (
              <Badge variant="outline" className="text-xs bg-background/80">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              // Add to wishlist logic
            }}
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              className="w-full"
              disabled={totalStock === 0}
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {totalStock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <Link href={`/products/${product.slug}`}>
          <div className="space-y-2">
            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
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
              <span className="font-bold text-lg">{priceDisplay}</span>
              {product.salePrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
