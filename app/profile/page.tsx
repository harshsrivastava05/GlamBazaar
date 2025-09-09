import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";

interface UserSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions) as UserSession | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const [user, orders, addresses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        createdAt: true,
        role: true,
      },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        items: { select: { id: true, quantity: true } },
      },
    }),
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        fullName: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        isDefault: true,
      },
    }),
  ]);

  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name ?? "Customer"}
          </p>
        </div>

        {isAdminOrManager && (
          <Button asChild>
            <Link href="/admin">Go to Admin</Link>
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Account */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{user?.name ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{user?.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{user?.phone ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Member since
                </div>
                <div className="font-medium">
                  {user?.createdAt ? formatDate(user.createdAt) : "—"}
                </div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/profile/settings">Edit profile</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No saved addresses.
              </div>
            ) : (
              addresses.map((a) => (
                <div key={a.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {a.fullName}{" "}
                      {a.isDefault && (
                        <span className="ml-2 text-xs text-primary">
                          (Default)
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/profile/address/${a.id}`}>Edit</Link>
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {a.addressLine1}
                    {a.addressLine2 ? `, ${a.addressLine2}` : ""}, {a.city},{" "}
                    {a.state} {a.postalCode}, {a.country}
                  </div>
                  <div className="text-sm">Phone: {a.phone}</div>
                </div>
              ))
            )}
            <Button size="sm" asChild>
              <Link href="/profile/address/new">Add address</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No orders placed yet.
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between border rounded p-3"
              >
                <div>
                  <div className="font-medium">#{o.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {o.items.length} items • {formatDate(o.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{o.status}</span>
                  <span className="font-medium">
                    {formatPrice(Number(o.totalAmount))}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orders/${o.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}