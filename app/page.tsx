import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getProducts } from '@/lib/db'
import ProductGrid from './components/product/product-grid'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Gem, Sparkles, Truck, Shield, Star, Users } from 'lucide-react'

async function FeaturedProducts() {
  const products = await getProducts({ featured: true, limit: 6 })
  return <ProductGrid products={products} />
}

export default function HomePage() {
  const categories = [
    {
      id: 1,
      name: 'Jewelry',
      slug: 'jewelry',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
      description: 'Exquisite diamonds, gold, and precious stones'
    },
    {
      id: 2,
      name: 'Cosmetics',
      slug: 'cosmetics',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
      description: 'Premium makeup and skincare products'
    }
  ]

  const features = [
    {
      icon: Truck,
      title: 'Same-Day Delivery',
      description: 'Free same-day delivery in Kanpur before 2 PM'
    },
    {
      icon: Shield,
      title: 'Authentic Products',
      description: 'Guaranteed authentic jewelry and cosmetics'
    },
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Curated collection from top brands'
    },
    {
      icon: Users,
      title: '10k+ Happy Customers',
      description: 'Trusted by thousands of satisfied customers'
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-background to-primary/5 py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Premium Collection
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Discover 
                  <span className="text-primary"> Luxury</span>
                  <br />
                  Jewelry & Cosmetics
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Explore our curated collection of premium jewelry and cosmetics with same-day delivery in Kanpur.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">
                    <Gem className="w-5 h-5 mr-2" />
                    Shop Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/category/jewelry">
                    View Collection
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop"
                  alt="Premium Jewelry Collection"
                  width={600}
                  height={600}
                  className="rounded-2xl shadow-2xl"
                  priority
                />
              </div>
              <div className="absolute -top-4 -left-4 w-full h-full bg-primary/10 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Shop by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated collections of premium jewelry and cosmetics
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <Card key={category.id} className="group cursor-pointer card-shadow overflow-hidden">
                <Link href={`/category/${category.slug}`}>
                  <div className="relative h-64">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/90">{category.description}</p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked premium products from our exclusive collection
            </p>
          </div>
          
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
            <FeaturedProducts />
          </Suspense>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">
                View All Products
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Why Choose GlamBazar?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best shopping experience
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center card-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}