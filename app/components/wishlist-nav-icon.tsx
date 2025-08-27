"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useSession } from "next-auth/react";

export function WishlistNavIcon() {
  const { data: session } = useSession();
  const { wishlistCount } = useWishlist();

  if (!session) {
    return (
      <Link
        href="/login?callbackUrl=/wishlist"
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        title="Wishlist"
      >
        <Heart className="h-6 w-6" />
      </Link>
    );
  }

  return (
    <Link
      href="/wishlist"
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      title={`Wishlist (${wishlistCount} items)`}
    >
      <Heart className="h-6 w-6" />

      {/* Counter Badge */}
      {wishlistCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      )}
    </Link>
  );
}
