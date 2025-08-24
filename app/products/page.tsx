import { Suspense } from 'react'
import { getProducts, getCategories } from '@/lib/db'
import ProductGrid, { ProductGridSkeleton } from '@/app/components/product/product-grid'
import ProductFilters from '@/app/components/product/product-filters'

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
    page?: string
  }>
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  // Await searchParams before using its properties
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 12
  const offset = (page - 1) * limit

  const [products, categories] = await Promise.all([
    getProducts({
      search: params.search,
      categoryId: params.category ? parseInt(params.category) : undefined,
      limit,
      offset,
      sortBy: params.sort?.split('_')[0] as 'name' | 'price' | 'created',
      sortOrder: params.sort?.split('_')[1] as 'asc' | 'desc',
    }),
    getCategories(),
  ])

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <ProductFilters categories={categories} />
      </div>
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              {params.search && `Results for "${params.search}" • `}
              {products.length} products found
            </p>
          </div>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Products - GlamBazar',
  description: 'Browse our collection of premium jewelry and cosmetics',
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="container py-8">
      <Suspense fallback={
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="h-8 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
            </div>
            <ProductGridSkeleton />
          </div>
        </div>
      }>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}