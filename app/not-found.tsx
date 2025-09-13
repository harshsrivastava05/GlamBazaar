import Link from 'next/link'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Home, Search, Gem, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <div className="container max-w-2xl">
        <Card className="card-shadow">
          <CardContent className="p-8 lg:p-12 text-center space-y-8">
            {/* 404 Display */}
            <div className="space-y-4">
              <div className="text-8xl lg:text-9xl font-bold text-primary/20 select-none">
                404
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Page Not Found
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg max-w-md mx-auto">
                Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been moved, deleted, or the URL might be incorrect.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Products
                </Link>
              </Button>
            </div>

            {/* Quick Links */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">
                Or explore our popular categories:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/category/jewelry">
                    <Gem className="w-4 h-4 mr-2" />
                    Jewelry
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/category/cosmetics">
                    Cosmetics
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/products">
                    All Products
                  </Link>
                </Button>
              </div>
            </div>

            {/* Back Button */}
            <div className="pt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}