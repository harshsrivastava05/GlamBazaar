'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Minus, Plus, ShoppingCart, Heart, Loader2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { useToast } from '@/app/components/ui/use-toast'

interface ProductVariant {
  id: number
  sku: string
  price: number
  stockQuantity: number
  isActive: boolean
}

interface AddToCartProps {
  productId: number
  variants: ProductVariant[]
  selectedVariant?: ProductVariant | null
  disabled?: boolean
}

export default function AddToCart({ 
  productId, 
  variants, 
  selectedVariant,
  disabled = false 
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  // Use selected variant or default to first available variant
  const activeVariant = selectedVariant || variants.find(v => v.isActive && v.stockQuantity > 0)
  const maxQuantity = activeVariant?.stockQuantity || 0
  const isOutOfStock = !activeVariant || maxQuantity === 0

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      })
      return
    }

    if (!activeVariant) {
      toast({
        title: "Please select options",
        description: "Please select all product options before adding to cart.",
        variant: "destructive",
      })
      return
    }

    setIsAddingToCart(true)

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          variantId: activeVariant.id,
          quantity,
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to cart",
          description: `${quantity} item(s) added to your cart.`,
        })
        
        // Reset quantity after successful add
        setQuantity(1)
        
        // Trigger cart update (you might want to use a context or state management)
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to add item to cart.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      })
      return
    }

    setIsAddingToWishlist(true)

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to wishlist",
          description: "Item added to your wishlist.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to add item to wishlist.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const handleBuyNow = () => {
    // Add to cart and redirect to checkout
    handleAddToCart().then(() => {
      window.location.href = '/checkout'
    })
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center border border-input rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            
            <Input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="h-8 w-16 border-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          
          {maxQuantity <= 5 && (
            <span className="text-xs text-muted-foreground">
              Only {maxQuantity} left in stock
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Button
            onClick={handleAddToCart}
            disabled={disabled || isOutOfStock || isAddingToCart || !activeVariant}
            className="w-full"
            size="lg"
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </Button>
          
          {!isOutOfStock && (
            <Button
              variant="outline"
              onClick={handleBuyNow}
              disabled={disabled || isAddingToCart || !activeVariant}
              className="w-full"
              size="lg"
            >
              Buy Now
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist}
          className="shrink-0"
        >
          {isAddingToWishlist ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      {/* Stock Information */}
      {activeVariant && (
        <div className="text-xs text-muted-foreground">
          <p>SKU: {activeVariant.sku}</p>
          {activeVariant.stockQuantity <= 10 && activeVariant.stockQuantity > 0 && (
            <p className="text-orange-600">
              Hurry! Only {activeVariant.stockQuantity} left in stock
            </p>
          )}
        </div>
      )}
    </div>
  )
}