import ProductCard from './product-card'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  basePrice: number
  salePrice?: number
  brand?: string
  featured: boolean
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  reviews: Array<{
    rating: number
  }>
  variants: Array<{
    id: number
    price: number
    stockQuantity: number
  }>
}

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}