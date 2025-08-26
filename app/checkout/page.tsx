import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import CheckoutClient from '../components/checkout-client'

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/checkout')
  }

  const [cartItems, addresses] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: { 
          select: { 
            id: true, 
            name: true, 
            slug: true, 
            basePrice: true, 
            images: { 
              where: { isPrimary: true }, 
              take: 1 
            } 
          } 
        },
        variant: true,
      }
    }),
    prisma.address.findMany({ 
      where: { userId: session.user.id }, 
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] 
    }),
  ])

  // Filter out cart items without products (data consistency)
  const validCartItems = cartItems.filter(item => item.product !== null)

  // Transform data for client component
  const clientCartItems = validCartItems.map(item => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product!.id,
      name: item.product!.name,
      slug: item.product!.slug,
      basePrice: Number(item.product!.basePrice),
      images: item.product!.images.map(img => ({
        id: img.id,
        url: img.url,
        altText: img.altText || item.product!.name
      }))
    },
    variant: item.variant ? {
      id: item.variant.id,
      price: Number(item.variant.price),
      sku: item.variant.sku
    } : null
  }))

  const clientAddresses = addresses.map(addr => ({
    id: addr.id,
    fullName: addr.fullName,
    phone: addr.phone,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
    isDefault: addr.isDefault
  }))

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <CheckoutClient 
        initialCartItems={clientCartItems}
        initialAddresses={clientAddresses}
      />
    </div>
  )
}