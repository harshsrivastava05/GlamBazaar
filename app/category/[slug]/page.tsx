import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProducts, getCategories, getCategoryBySlug } from "@/lib/db";
import ProductGrid, {
  ProductGridSkeleton,
} from "@/app/components/product/product-grid";
import ProductFilters from "@/app/components/product/product-filters";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string | string[];
  }>;
}

async function CategoryContent({ params, searchParams }: CategoryPageProps) {
  // Await both params and searchParams before using their properties
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  const [category, categories] = await Promise.all([
    getCategoryBySlug(resolvedParams.slug),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  // Get all category IDs to include (parent + children)
  const categoryIds = [category.id];
  if (category.children && category.children.length > 0) {
    categoryIds.push(...category.children.map((child) => child.id));
  }

  // Fix the sortBy and sortOrder parsing
  const sortParts = resolvedSearchParams.sort?.split("_") || [];
  const sortBy = sortParts[0] as "name" | "price" | "created" | undefined;
  const sortOrder = sortParts[1] as "asc" | "desc" | undefined;

  // Fix brand parameter handling
  const brands = Array.isArray(resolvedSearchParams.brand)
    ? resolvedSearchParams.brand
    : resolvedSearchParams.brand
    ? [resolvedSearchParams.brand]
    : undefined;

  const products = await getProducts({
    search: resolvedSearchParams.search,
    categoryIds: categoryIds,
    limit,
    offset,
    sortBy,
    sortOrder,
    minPrice: resolvedSearchParams.minPrice
      ? parseFloat(resolvedSearchParams.minPrice)
      : undefined,
    maxPrice: resolvedSearchParams.maxPrice
      ? parseFloat(resolvedSearchParams.maxPrice)
      : undefined,
    brands,
  });

  // Get category hero images
  const categoryImages = {
    jewelry:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&h=400&fit=crop",
    cosmetics:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop",
    rings:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&h=400&fit=crop",
    necklaces:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=400&fit=crop",
    earrings:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&h=400&fit=crop",
    makeup:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=400&fit=crop",
    skincare:
      "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=1200&h=400&fit=crop",
    fragrances:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&h=400&fit=crop",
  };

  const heroImage =
    categoryImages[resolvedParams.slug as keyof typeof categoryImages] ||
    categoryImages.jewelry;

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category.parent && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/category/${category.parent.slug}`}>
                  {category.parent.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Hero */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8">
        <Image
          src={heroImage}
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg md:text-xl max-w-2xl">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.children.map((subcategory) => (
              <Card
                key={subcategory.id}
                className="group cursor-pointer hover:shadow-md transition-shadow"
              >
                <Link href={`/category/${subcategory.slug}`}>
                  <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                    <Image
                      src={
                        categoryImages[
                          subcategory.slug as keyof typeof categoryImages
                        ] || heroImage
                      }
                      alt={subcategory.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {subcategory.name}
                    </h3>
                    {subcategory.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {subcategory.description}
                      </p>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            currentCategoryId={category.id}
          />
        </div>
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{category.name} Products</h2>
              <p className="text-muted-foreground">
                {resolvedSearchParams.search &&
                  `Results for "${resolvedSearchParams.search}" in ${category.name} • `}
                {products.length} products found
              </p>
            </div>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}

          {/* Pagination */}
          {products.length === limit && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                {page > 1 && (
                  <Button variant="outline" asChild>
                    <Link href={`/category/${resolvedParams.slug}?page=${page - 1}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href={`/category/${resolvedParams.slug}?page=${page + 1}`}>
                    Next
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    return {
      title: "Category Not Found - GlamBazar",
    };
  }

  return {
    title: `${category.name} - GlamBazar`,
    description:
      category.description ||
      `Shop premium ${category.name.toLowerCase()} at GlamBazar. Free same-day delivery in Kanpur.`,
    openGraph: {
      title: `${category.name} - GlamBazar`,
      description:
        category.description ||
        `Premium ${category.name.toLowerCase()} collection`,
      images: [
        {
          url: `https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&h=630&fit=crop`,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  const allCategories = categories.reduce((acc, category) => {
    acc.push({ slug: category.slug });
    if (category.children) {
      category.children.forEach((child) => {
        acc.push({ slug: child.slug });
      });
    }
    return acc;
  }, [] as { slug: string }[]);

  return allCategories;
}

export default function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="space-y-8">
            {/* Breadcrumb skeleton */}
            <div className="h-4 bg-muted rounded w-48 animate-pulse" />

            {/* Hero skeleton */}
            <div className="h-64 md:h-80 bg-muted rounded-lg animate-pulse" />

            {/* Content skeleton */}
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-muted rounded animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="mb-6">
                  <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                </div>
                <ProductGridSkeleton />
              </div>
            </div>
          </div>
        }
      >
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}