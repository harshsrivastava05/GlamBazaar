import { Suspense } from 'react'
import ProductCard from './product-card'
import { Card, CardContent } from '@/app/components/ui/card'
import { Product } from '@/lib/types' // Import the correct Product type

interface ProductGridProps {
  products: Product[]
  className?: string
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="aspect-square bg-muted" />
          <CardContent className="p-4 space-y-2">
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-5 bg-muted rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No products found.</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export { ProductGridSkeleton }