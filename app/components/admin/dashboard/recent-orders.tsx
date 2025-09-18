// app/components/admin/dashboard/recent-orders.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Decimal } from "@prisma/client/runtime/library";

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number | Decimal;
  status: string;
  user: {
    name: string | null;
    email: string | null;
  };
  items: Array<{
    product: {
      name: string;
    };
  }>;
}

interface RecentOrdersProps {
  orders: Order[];
}

function getStatusVariant(status: string) {
  switch (status) {
    case "DELIVERED":
      return "default";
    case "PROCESSING":
      return "secondary";
    case "SHIPPED":
      return "outline";
    default:
      return "outline";
  }
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent orders
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.user.name} • {order.items.length} items
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-2 sm:space-x-0">
                  <p className="text-sm font-medium">
                    ₹{order.totalAmount.toString()}
                  </p>
                  <Badge
                    variant={getStatusVariant(order.status)}
                    className="text-xs"
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
