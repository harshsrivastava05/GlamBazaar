'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Gem,
  LogOut,
  Settings,
  Package,
  Heart,
  Shield
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import { useWishlist } from '@/hooks/use-wishlist'

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isCartLoading, setIsCartLoading] = useState(false)
  const { data: session, status } = useSession()
  const { wishlistCount } = useWishlist()
  const router = useRouter()

  // Check if user is admin or manager
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'

  // Fetch cart count on mount and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchCartCount()
      // Set up periodic refresh for cart count (every 30 seconds)
      const interval = setInterval(fetchCartCount, 30000)
      return () => clearInterval(interval)
    } else {
      setCartCount(0)
    }
  }, [session])

  // Listen for storage events to update cart count across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart-updated' && session?.user?.id) {
        fetchCartCount()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [session])

  const fetchCartCount = async () => {
    if (!session?.user?.id) return
    
    setIsCartLoading(true)
    try {
      const response = await fetch('/api/cart/count', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error)
    } finally {
      setIsCartLoading(false)
    }
  }

  // Function to update cart count from external components
  const updateCartCount = (newCount: number) => {
    setCartCount(newCount)
    // Trigger storage event for other tabs
    localStorage.setItem('cart-updated', Date.now().toString())
  }

  // Expose updateCartCount globally for other components to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).updateCartCount = updateCartCount
    }
  }, [])

  const navigation = [
    { name: 'Products', href: '/products' },
    { name: 'Jewelry', href: '/category/jewelry' },
    { name: 'Cosmetics', href: '/category/cosmetics' },
    { name: 'Sale', href: '/products?sale=true' },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">GlamBazar</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <div className="hidden md:flex flex-1 justify-center px-4 lg:px-6">
              <div className="w-full max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search jewelry, cosmetics..."
                    className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onFocus={() => setIsSearchOpen(true)}
                  />
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Admin Link - Only show for admin users */}
              {session && isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="hidden sm:flex items-center text-foreground hover:text-foreground bg-transparent hover:bg-accent"
                >
                  <Link href="/admin" className="flex items-center">
                    <Shield className="h-4 w-4 mr-1.5" />
                    Admin
                  </Link>
                </Button>
              )}

              {/* Wishlist */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 text-foreground hover:text-foreground bg-transparent hover:bg-accent" 
                asChild
              >
                <Link href={session ? "/wishlist" : "/login?callbackUrl=/wishlist"}>
                  <Heart className="h-4 w-4" />
                  {session && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-lg ring-2 ring-background">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                  <span className="sr-only">Wishlist</span>
                </Link>
              </Button>

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 text-foreground hover:text-foreground bg-transparent hover:bg-accent" 
                asChild
              >
                <Link href="/cart">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-lg ring-2 ring-background animate-in zoom-in-50 duration-200">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                  {isCartLoading && (
                    <div className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Link>
              </Button>

              {/* User Menu */}
              {status === 'loading' ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-foreground hover:text-foreground bg-transparent hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      {isAdmin && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {session.user?.role}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/orders" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-blue-500 text-white text-xs font-semibold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                            {wishlistCount > 99 ? '99+' : wishlistCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="text-foreground hover:text-foreground bg-transparent hover:bg-accent"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button 
                    size="sm" 
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-foreground hover:text-foreground bg-transparent hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="border-t md:hidden">
            <div className="container py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search jewelry, cosmetics..."
                  className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="container py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 border-t space-y-1">
                {session ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-blue-500 text-white text-xs font-semibold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                          {wishlistCount > 99 ? '99+' : wishlistCount}
                        </span>
                      )}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}