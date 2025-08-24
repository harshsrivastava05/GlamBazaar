"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { useToast } from "@/app/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    basePrice: number;
    salePrice?: number;
    images: Array<{
      url: string;
      altText: string;
    }>;
  };
  variant?: {
    id: number;
    sku: string;
    price: number;
    stockQuantity: number;
    variantAttributes: Array<{
      attribute: {
        displayName: string;
      };
      attributeOption: {
        displayValue: string;
        colorHex?: string;
      };
    }>;
  };
}

interface CartSummary {
  totalItems: number;
  subtotal: number;
  itemCount: number;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>({
    totalItems: 0,
    subtotal: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchCartItems();
    }
  }, [status, router]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items);
        setSummary(data.summary);
      } else {
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(cartItemId);
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update quantity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        toast({
          title: "Success",
          description: "Item removed from cart",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some products to get started
          </p>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {summary.totalItems} items in your cart
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => {
              const price = item.variant?.price || item.product.basePrice;
              const image = item.product.images;

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={image?.url || "/placeholder-product.jpg"}
                          alt={image?.altText || item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="font-medium hover:text-primary"
                            >
                              {item.product.name}
                            </Link>
                            {item.variant && (
                              <div className="flex gap-2 mt-1">
                                {item.variant.variantAttributes.map((attr) => (
                                  <Badge
                                    key={attr.attribute.displayName}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {attr.attribute.displayName}:{" "}
                                    {attr.attributeOption.displayValue}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatPrice(price)} each
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-input rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={
                                item.quantity <= 1 || updating === item.id
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.variant?.stockQuantity || 99}
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity =
                                  parseInt(e.target.value) || 1;
                                if (newQuantity !== item.quantity) {
                                  updateQuantity(item.id, newQuantity);
                                }
                              }}
                              className="h-8 w-16 border-0 text-center focus-visible:ring-0"
                              disabled={updating === item.id}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={
                                updating === item.id ||
                                (item.variant &&
                                  item.quantity >= item.variant.stockQuantity)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="font-medium">
                            {formatPrice(Number(price) * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({summary.totalItems} items)</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
