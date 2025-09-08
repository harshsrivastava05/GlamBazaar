"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { useToast } from "@/app/components/ui/use-toast";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowLeft, Package, MapPin, CreditCard, FileText } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    images: Array<{
      url: string;
      altText: string;
    }>;
  };
  variant?: {
    id: number;
    sku: string;
    variantAttributes?: Array<{
      attribute: {
        name: string;
        displayName: string;
      };
      attributeOption: {
        value: string;
        displayValue: string;
      };
    }>;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  deliveryType: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  transactions: Array<{
    id: number;
    transactionId: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-gray-100 text-gray-800",
};

const paymentStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else if (response.status === 404) {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        router.push("/orders");
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch order details",
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
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="w-48 h-8 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="w-full h-48 bg-muted rounded animate-pulse" />
              <div className="w-full h-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="w-full h-48 bg-muted rounded animate-pulse" />
              <div className="w-full h-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Status & Items */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Order Status</span>
                  <Badge
                    className={
                      statusColors[order.status as keyof typeof statusColors]
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Status</span>
                  <Badge
                    className={
                      paymentStatusColors[
                        order.paymentStatus as keyof typeof paymentStatusColors
                      ]
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium">
                    {order.paymentMethod.replace("_", " ")}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <span>Tracking Number</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div className="flex items-center justify-between">
                    <span>Estimated Delivery</span>
                    <span className="font-medium">
                      {formatDate(order.estimatedDeliveryDate)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex space-x-4">
                      <div className="w-16 h-16 relative bg-muted rounded-lg overflow-hidden">
                        {item.product?.images?.[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].altText}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium">
                          {item.product ? (
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="hover:underline"
                            >
                              {item.product.name}
                            </Link>
                          ) : (
                            "Product not available"
                          )}
                        </h4>
                        {item.variant?.variantAttributes && (
                          <div className="text-sm text-muted-foreground">
                            {item.variant.variantAttributes.map(
                              (attr, index) => (
                                <span key={attr.attribute.name}>
                                  {attr.attribute.displayName}:{" "}
                                  {attr.attributeOption.displayValue}
                                  {index <
                                    item.variant!.variantAttributes!.length -
                                      1 && ", "}
                                </span>
                              )
                            )}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.variant?.sku || "N/A"}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">
                          {formatPrice(item.totalPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(item.unitPrice)} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{order.shippingName}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.shippingPhone}
                  </div>
                  <div className="text-sm">
                    {order.shippingAddressLine1}
                    {order.shippingAddressLine2 && <br />}
                    {order.shippingAddressLine2}
                  </div>
                  <div className="text-sm">
                    {order.shippingCity}, {order.shippingState}{" "}
                    {order.shippingPostalCode}
                  </div>
                  <div className="text-sm">{order.shippingCountry}</div>
                  <div className="text-sm font-medium mt-2">
                    Delivery: {order.deliveryType.replace("_", " ")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.taxAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(order.taxAmount)}</span>
                    </div>
                  )}
                  {order.shippingAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Shipping</span>
                      <span>{formatPrice(order.shippingAmount)}</span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Transactions */}
            {order.transactions && order.transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Payment History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">
                            {transaction.transactionId}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatPrice(transaction.amount)}
                          </div>
                          <Badge
                            className={
                              paymentStatusColors[
                                transaction.status as keyof typeof paymentStatusColors
                              ]
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
          {order.status === "DELIVERED" && (
            <Button variant="outline">Download Invoice</Button>
          )}
          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
            <Button variant="destructive">Cancel Order</Button>
          )}
        </div>
      </div>
    </div>
  );
}
