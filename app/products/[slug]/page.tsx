import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import { getProductBySlug, getProducts } from '@/lib/db'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import ProductGallery from '@/app/components/product/product-gallery'
import VariantSelector from '@/app/components/product/variant-selector'
import ProductReviews from '@/app/components/product/product-reviews'
import RelatedProducts from '@/app/components/product/related-products'
import AddToCart from '@/app/components/cart/add-to-cart'
import { formatPrice } from '@/lib/utils'
import { Star, Heart, Share, ShoppingCart, Truck, Shield, RefreshCw } from 'lucide-react'

interface ProductPageProps {
  params: { slug: string }
}

async function ProductContent({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0

  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0)

  const relatedProducts = await getProducts({
    categoryId: product.categoryId,
    limit: 4,
  }).then(products => products.filter(p => p.id !== product.id))

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Gallery */}
        <div>
          <ProductGallery images={product.images} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Home</span>
            <span>/</span>
            <span>{product.category?.name}</span>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>
          )}

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">{product.shortDescription}</p>
          </div>

          {/* Rating */}
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="font-medium ml-1">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews.length} reviews)
              </span>
            </div>
          )}

          {/* Price - Fixed the price display logic */}
          <div className="flex items-center gap-4">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-bold">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold">
                {formatPrice(product.basePrice)}
              </span>
            )}
            {product.featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </div>

          {/* Variant Selection */}
          <VariantSelector variants={product.variants} />

          {/* Add to Cart */}
          <AddToCart 
            productId={product.id} 
            variants={product.variants}
            disabled={totalStock === 0}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Add to wishlist</span>
            </Button>
            <Button variant="outline" size="icon">
              <Share className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-3 pt-6 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-4 w-4 text-primary" />
              <span>Same-day delivery in Kanpur</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Authentic products guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span>7-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-primary py-2 px-1 text-sm font-medium text-primary">
              Description
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted">
              Reviews ({product.reviews.length})
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted">
              Shipping
            </button>
          </nav>
        </div>
        <div className="py-8">
          <div className="prose prose-sm max-w-none">
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews reviews={product.reviews} productId={product.id} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </>
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found - GlamBazar',
    }
  }

  return {
    title: `${product.name} - GlamBazar`,
    description: product.shortDescription || product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: product.images.map(img => ({
        url: img.url,
        alt: img.altText,
      })),
    },
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="container py-8">
      <Suspense fallback={
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-8 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-6 bg-muted rounded animate-pulse w-1/4" />
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-12 bg-muted rounded animate-pulse" />
          </div>
        </div>
      }>
        <ProductContent params={params} />
      </Suspense>
    </div>
  )
}