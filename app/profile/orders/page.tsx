import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { formatDate, formatPrice } from '@/lib/utils'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/orders')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
    },
  })

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No orders placed yet.</p>
            <Button className="mt-4" asChild><Link href="/products">Start Shopping</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{order.orderNumber}</CardTitle>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{order.status}</span>
                    <span className="font-medium">{formatPrice(Number(order.totalAmount))}</span>
                    <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                    <Button variant="outline" asChild><Link href={`/orders/${order.id}`}>View</Link></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map(item => {
                  const img = item.product?.images?.[0] // Fixed: Access first image
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-16 h-16">
                        <Image src={img?.url || '/placeholder-product.jpg'} alt={img?.altText || item.product?.name || 'Product'} fill className="object-cover rounded" />
                      </div>
                      <div className="flex-1">
                        <Link href={`/products/${item.product?.slug}`} className="font-medium hover:text-primary">
                          {item.product?.name}
                        </Link>
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-medium">{formatPrice(Number(item.unitPrice) * item.quantity)}</div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}