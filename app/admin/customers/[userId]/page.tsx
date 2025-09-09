import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    const { userId } = await params;
    redirect(
      "/login?callbackUrl=" +
        encodeURIComponent(`/admin/customers/${userId}`)
    );
  }

  const { userId } = await params;
  const customer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      role: true,
      createdAt: true,
      addresses: {
        select: {
          id: true,
          fullName: true,
          addressLine1: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          isDefault: true,
        },
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          title: true,
          createdAt: true,
          product: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
          items: { select: { quantity: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { orders: true, reviews: true, addresses: true } },
    },
  });
  if (!customer) notFound();

  const totalSpent = customer.orders.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0
  );
  const averageOrderValue =
    customer._count.orders > 0 ? totalSpent / customer._count.orders : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={customer.image || ""} />
            <AvatarFallback>
              {customer.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{customer.name || "Unnamed"}</h1>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <Badge
          variant={
            customer.role === "ADMIN"
              ? "destructive"
              : customer.role === "MANAGER"
              ? "default"
              : "secondary"
          }
        >
          {customer.role}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer._count.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(averageOrderValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer._count.reviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer.addresses.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No saved addresses.
            </div>
          ) : (
            customer.addresses.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border rounded p-3"
              >
                <div>
                  <div className="font-medium">
                    {a.fullName}{" "}
                    {a.isDefault && (
                      <span className="text-xs text-primary ml-2">
                        (Default)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {a.addressLine1}, {a.city}, {a.state} {a.postalCode},{" "}
                    {a.country}
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/orders?customer=${customer.id}`}>
                    View Orders
                  </Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer.orders.length === 0 ? (
            <div className="text-sm text-muted-foreground">No orders yet.</div>
          ) : (
            customer.orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between border rounded p-3"
              >
                <div>
                  <div className="font-medium">#{o.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {o.items.reduce((s, it) => s + it.quantity, 0)} items •{" "}
                    {formatDate(o.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{o.status}</span>
                  <span className="font-medium">
                    {formatPrice(Number(o.totalAmount))}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/orders/${o.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer.reviews.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No reviews written.
            </div>
          ) : (
            customer.reviews.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border rounded p-3"
              >
                <div>
                  <div className="font-medium">
                    {r.title || `Rated ${r.rating}/5`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(r.createdAt)} •{" "}
                    <Link
                      className="hover:text-primary"
                      href={`/products/${r.product.slug}`}
                    >
                      {r.product.name}
                    </Link>
                  </div>
                </div>
                <Badge variant="outline">{r.rating}★</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}