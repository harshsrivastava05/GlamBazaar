'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface CheckoutCartItem {
  id: number
  quantity: number
  product: {
    id: number
    name: string
    slug: string
    basePrice: number
    images: Array<{
      id: number
      url: string
      altText: string
    }>
  }
  variant: {
    id: number
    price: number
    sku: string
  } | null
}

interface CheckoutAddress {
  id: number
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface CheckoutClientProps {
  initialCartItems: CheckoutCartItem[]
  initialAddresses: CheckoutAddress[]
}

export default function CheckoutClient({ 
  initialCartItems, 
  initialAddresses 
}: CheckoutClientProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    initialAddresses.find(addr => addr.isDefault)?.id || initialAddresses[0]?.id || null
  )
  const [loading, setLoading] = useState(false)

  const totalPrice = initialCartItems.reduce((sum, item) => {
    const unitPrice = item.variant?.price ?? item.product.basePrice
    return sum + unitPrice * item.quantity
  }, 0)

  const deliveryFee = selectedAddressId ? 99 : 0 // Example logic
  const grandTotal = totalPrice + deliveryFee

  const handleOrder = async () => {
    if (initialCartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    if (!selectedAddressId) {
      alert('Please select a shipping address')
      return
    }

    setLoading(true)
    
    try {
      const selectedAddress = initialAddresses.find(addr => addr.id === selectedAddressId)
      if (!selectedAddress) {
        throw new Error('Selected address not found')
      }

      const orderData = {
        items: initialCartItems.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id || null,
          quantity: item.quantity,
          unitPrice: item.variant?.price ?? item.product.basePrice,
        })),
        subtotal: totalPrice,
        shippingAmount: deliveryFee,
        totalAmount: grandTotal,
        paymentMethod: 'COD',
        shippingName: selectedAddress.fullName,
        shippingPhone: selectedAddress.phone,
        shippingAddressLine1: selectedAddress.addressLine1,
        shippingAddressLine2: selectedAddress.addressLine2,
        shippingCity: selectedAddress.city,
        shippingState: selectedAddress.state,
        shippingPostalCode: selectedAddress.postalCode,
        shippingCountry: selectedAddress.country,
        deliveryType: 'SPEEDPOST'
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const responseData = await res.json()
      
      if (res.ok) {
        // Clear cart after successful order
        await fetch('/api/cart', { method: 'DELETE' })
        window.location.href = `/orders/${responseData.id}`
      } else {
        alert(responseData.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Order creation error:', error)
      alert('Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Cart Review */}
      <Card>
        <CardHeader>
          <CardTitle>Review Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {initialCartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            initialCartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 relative">
                    <img 
                      src={item.product.images?.[0]?.url || '/placeholder.jpg'} 
                      alt={item.product.images?.[0]?.altText || item.product.name} 
                      className="object-cover w-full h-full rounded" 
                    />
                  </div>
                  <div>
                    <h2 className="text-md font-semibold">{item.product.name}</h2>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    {item.variant && (
                      <p className="text-sm text-muted-foreground">SKU: {item.variant.sku}</p>
                    )}
                  </div>
                </div>
                <div className="font-medium">
                  {formatPrice((item.variant?.price ?? item.product.basePrice) * item.quantity)}
                </div>
              </div>
            ))
          )}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          {initialAddresses.length === 0 ? (
            <p>
              No saved addresses.{' '}
              <a href="/profile/address/new" className="text-blue-500 hover:underline">
                Add Address
              </a>
            </p>
          ) : (
            <div className="space-y-2">
              {initialAddresses.map((addr) => (
                <div 
                  key={addr.id} 
                  className={`border p-3 rounded cursor-pointer hover:bg-gray-50 ${
                    selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedAddressId(addr.id)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`addr-${addr.id}`}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="accent-blue-500"
                    />
                    <div>
                      <p className="font-medium">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-sm text-gray-600">{addr.country}</p>
                      <p className="text-sm text-gray-500">Ph: {addr.phone}</p>
                      {addr.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleOrder} 
          disabled={loading || initialCartItems.length === 0 || !selectedAddressId}
          className="px-8 py-2"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </Button>
      </div>
    </div>
  )
}