import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { formatPrice, formatDate } from '@/lib/utils'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('your-stripe-publishable-key')

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/checkout')

  const [cartItems, addresses] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: { select: { id: true, name: true, slug: true, basePrice: true, images: { where: { isPrimary: true }, take: 1 } } },
        variant: true,
      }
    }),
    prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] }),
  ])

  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || null)
  const [loading, setLoading] = useState(false)

  const totalPrice = cartItems.reduce((sum, item) => {
    const unitPrice = item.variant?.price ?? (item.product ? item.product.basePrice : 0)
    return sum + Number(unitPrice) * item.quantity
  }, 0)
  const deliveryFee = selectedAddressId ? 99 : 0 // Example: 99 for Kanpur, replace with actual logic if needed
  const grandTotal = totalPrice + deliveryFee

  const handleOrder = async () => {
    setLoading(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map((item) => ({
          productId: item.product?.id ?? null,
          variantId: item.variant?.id,
          quantity: item.quantity,
          unitPrice: Number(item.variant?.price ?? item.product.basePrice),
        })),
        subtotal: totalPrice,
        totalAmount: grandTotal,
        shippingAddressId: selectedAddressId,
        deliveryType: selectedAddressId ? 'standard' : 'express',
      }),
    })
    const orderData = await res.json()
    if (res.ok) {
      // Proceed to payment if needed
      const stripe = await stripePromise
      // Create a checkout session on your backend, get sessionId
      // For demo: simulate redirect
      window.location.href = `/orders/${orderData.id}`
    } else {
      alert('Failed to create order')
    }
    setLoading(false)
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {/* Cart Review */}
      <Card>
        <CardHeader><CardTitle>Review Your Cart</CardTitle></CardHeader>
        <CardContent>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 relative">
                    <img src={item.product.images?.[0]?.url || '/placeholder.jpg'} alt={item.product.images?.[0]?.altText || item.product.name} className="object-cover w-full h-full rounded" />
                  </div>
                  <div>
                    <h2 className="text-md font-semibold">{item.product.name}</h2>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-medium">{formatPrice(Number(item.variant?.price ?? item.product.basePrice) * item.quantity)}</div>
              </div>
            ))
          )}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Delivery</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Selection */}
      <Card>
        <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <p>No saved addresses. <a href="/profile/address/new" className="text-blue-500">Add Address</a></p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <div key={addr.id} className={`border p-3 rounded ${selectedAddressId === addr.id ? 'border-primary' : ''}`}>
                  <label htmlFor={`addr-${addr.id}`} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      id={`addr-${addr.id}`}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="accent-primary"
                    />
                    <div>
                      <p>{addr.fullName}</p>
                      <p className="text-sm text-muted-foreground">{addr.addressLine1}, {addr.city}</p>
                      <p className="text-sm text-muted-foreground">{addr.postalCode}, {addr.country}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button variant="primary" onClick={handleOrder} disabled={loading || cartItems.length === 0}>
        {loading ? 'Processing...' : 'Place Order'}
      </Button>
    </div>
  )
}