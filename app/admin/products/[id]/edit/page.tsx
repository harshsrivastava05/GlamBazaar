// app/admin/products/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProductEditForm } from "@/app/components/admin/products/product-edit-form";
import { ProductImage, ProductVariant, VariantAttribute } from "@/lib/types";
import { Decimal } from "@prisma/client/runtime/library";

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

interface PrismaProductImage {
  id: number;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface PrismaAttributeOption {
  id: number;
  value: string;
  displayValue: string;
  colorHex: string | null;
}

interface PrismaAttribute {
  id: number;
  name: string;
  displayName: string;
  type: string;
}

interface PrismaVariantAttribute {
  id: number;
  attributeId: number;
  attributeOptionId: number;
  attribute: PrismaAttribute;
  attributeOption: PrismaAttributeOption;
}

interface PrismaProductVariant {
  id: number;
  sku: string;
  price: Decimal;
  compareAtPrice: Decimal | null;
  stockQuantity: number;
  isActive: boolean;
  variantAttributes: PrismaVariantAttribute[];
}

interface PrismaProductData {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  categoryId: number;
  brand: string | null;
  basePrice: Decimal;
  salePrice: Decimal | null;
  featured: boolean;
  isActive: boolean;
  tags: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
  };
  images: PrismaProductImage[];
  variants: PrismaProductVariant[];
  _count: {
    reviews: number;
  };
}

function transformProduct(product: PrismaProductData) {
  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    totalStock: product.variants.reduce(
      (sum: number, variant: PrismaProductVariant) =>
        sum + variant.stockQuantity,
      0
    ),
    reviewCount: product._count.reviews,
    images: product.images.map(
      (img: PrismaProductImage): ProductImage => ({
        id: img.id,
        url: img.url,
        altText: img.altText || "",
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })
    ),
    variants: product.variants.map(
      (variant: PrismaProductVariant): ProductVariant => ({
        id: variant.id,
        sku: variant.sku,
        price: Number(variant.price),
        compareAtPrice: variant.compareAtPrice
          ? Number(variant.compareAtPrice)
          : undefined,
        stockQuantity: variant.stockQuantity,
        isActive: variant.isActive,
        variantAttributes: variant.variantAttributes.map(
          (va: PrismaVariantAttribute): VariantAttribute => ({
            id: va.id,
            attributeId: va.attributeId,
            attributeOptionId: va.attributeOptionId,
            attribute: {
              id: va.attribute.id,
              name: va.attribute.name,
              type: va.attribute.type,
              displayName: va.attribute.displayName,
            },
            attributeOption: {
              id: va.attributeOption.id,
              value: va.attributeOption.value,
              displayValue: va.attributeOption.displayValue,
              colorHex: va.attributeOption.colorHex,
            },
          })
        ),
      })
    ),
  };
}

async function getProduct(
  id: number
): Promise<ReturnType<typeof transformProduct> | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        include: {
          variantAttributes: {
            include: {
              attribute: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  type: true,
                },
              },
              attributeOption: {
                select: {
                  id: true,
                  value: true,
                  displayValue: true,
                  colorHex: true,
                },
              },
            },
          },
        },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) return null;

  return transformProduct(product as PrismaProductData);
}

async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export default async function ProductEditPage({
  params,
}: ProductEditPageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const productId = parseInt(id);
  if (isNaN(productId)) {
    notFound();
  }

  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    getProduct(productId),
    getCategories(),
  ]);

  if (!product) {
    notFound();
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
  );
}
