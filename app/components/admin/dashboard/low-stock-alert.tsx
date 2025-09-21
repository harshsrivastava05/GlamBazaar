// app/components/admin/dashboard/low-stock-alert.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"

interface ProductVariant {
  id: string
  sku: string
  stockQuantity: number
  product: {
    name: string
  }
}

interface LowStockAlertProps {
  products: ProductVariant[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alert</CardTitle>
        <CardDescription>Products running low on inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              All products are well stocked
            </p>
          ) : (
            products.map((variant) => (
              <div
                key={variant.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {variant.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SKU: {variant.sku}
                  </p>
                </div>
                <Badge
                  variant={variant.stockQuantity === 0 ? "destructive" : "outline"}
                  className="text-xs self-start sm:self-auto"
                >
                  {variant.stockQuantity} left
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}