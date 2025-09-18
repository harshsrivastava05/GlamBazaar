// app/admin/products/[id]/edit/page.tsx
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProductEditForm } from "@/app/components/admin/products/product-edit-form"

interface ProductEditPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        include: {
          variantAttributes: {
            include: {
              attribute: { select: { name: true, displayName: true } },
              attributeOption: {
                select: { value: true, displayValue: true },
              },
            },
          },
        },
      },
      _count: { select: { reviews: true } },
    },
  })

  if (!product) return null

  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    totalStock: product.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
    reviewCount: product._count.reviews,
  }
}

async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  const productId = parseInt(id)
  if (isNaN(productId)) {
    notFound()
  }

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    notFound()
  }

  const [product, categories] = await Promise.all([
    getProduct(productId),
    getCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Edit Product
          </h1>
          <p className="text-muted-foreground">
            Update product information and settings
          </p>
        </div>
      </div>

      <ProductEditForm product={product} categories={categories} />
    </div>
  )
}