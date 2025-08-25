import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { formatDate, formatPrice } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/orders')

  const order = await prisma.order.findUnique({
    where: { 
      id: parseInt(params.id),
      userId: session.user.id as string // Ensure user can only access their orders
    },
    include: {
      items: {
        include: {
          product: { 
            select: { 
              id: true, 
              name: true, 
              slug: true, 
              images: { where: { isPrimary: true }, take: 1 } 
            } 
          },
          variant: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map(item => {
              const img = item.product?.images?.[0]
              return (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image 
                      src={img?.url || '/placeholder-product.jpg'} 
                      alt={img?.altText || item.product?.name || 'Product'} 
                      fill 
                      className="object-cover rounded" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/products/${item.product?.slug}`} 
                      className="font-medium hover:text-primary truncate block"
                    >
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <div className="text-sm text-muted-foreground">
                        Variant: {item.variant.sku}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(Number(item.unitPrice))}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatPrice(Number(item.totalPrice))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium">{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                {order.deliveryType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Type:</span>
                    <span>{order.deliveryType.replace('_', ' ')}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking:</span>
                    <span className="font-mono text-sm">{order.trackingNumber}</span>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Delivery:</span>
                    <span>{formatDate(order.estimatedDeliveryDate)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                {order.shippingAmount && Number(order.shippingAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>{formatPrice(Number(order.shippingAmount))}</span>
                  </div>
                )}
                {order.taxAmount && Number(order.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{formatPrice(Number(order.taxAmount))}</span>
                  </div>
                )}
                {order.discountAmount && Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(Number(order.discountAmount))}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(Number(order.totalAmount))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="font-medium">{order.shippingName}</div>
                <div>{order.shippingPhone}</div>
                <div className="text-muted-foreground">
                  {order.shippingAddressLine1}
                  {order.shippingAddressLine2 && <><br />{order.shippingAddressLine2}</>}
                  <br />{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                  <br />{order.shippingCountry}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}