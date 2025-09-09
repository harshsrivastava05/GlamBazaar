"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useToast } from "@/app/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { UserRole } from "@prisma/client";

interface Product {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  salePrice?: number;
  brand?: string;
  isActive: boolean;
  featured: boolean;
  totalStock: number;
  reviewCount: number;
  category: { id: number; name: string };
  images: Array<{ url: string; isPrimary: boolean }>;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all_categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/products");
      return;
    }

    // Check if user has admin/manager role - Updated to use correct enum values
    if (
      session?.user?.role !== UserRole.ADMIN &&
      session?.user?.role !== UserRole.MANAGER
    ) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page",
        variant: "destructive",
      });
      router.push("/");
      return;
    }
  }, [session, status, router, toast]);

  const fetchProducts = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter &&
          categoryFilter !== "all_categories" && { category: categoryFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/products?${params}`);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to fetch products:", err);
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch products: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, statusFilter, session?.user, toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user?.role === UserRole.ADMIN ||
        session?.user?.role === UserRole.MANAGER)
    ) {
      fetchProducts();
      fetchCategories();
    }
  }, [fetchProducts, fetchCategories, status, session]);

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        fetchProducts();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Delete failed" }));
        throw new Error(errorData.error || "Delete failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      console.error("Delete error:", err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (
    productId: number,
    currentStatus: boolean,
  ) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${
            !currentStatus ? "activated" : "deactivated"
          } successfully`,
        });
        fetchProducts();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Update failed" }));
        throw new Error(errorData.error || "Update failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Update failed";
      console.error("Status toggle error:", err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  if (
    status !== "authenticated" ||
    (session?.user?.role !== UserRole.ADMIN &&
      session?.user?.role !== UserRole.MANAGER)
  ) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={() => {
                setError(null);
                fetchProducts();
              }}
              className="mt-2"
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={categoryFilter || "all_categories"}
              onValueChange={(value) =>
                setCategoryFilter(value === "all_categories" ? "" : value)
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                    <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No products found</p>
              {searchTerm ||
              categoryFilter !== "all_categories" ||
              statusFilter !== "all" ? (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all_categories");
                    setStatusFilter("all");
                  }}
                  variant="outline"
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button asChild className="mt-2">
                  <Link href="/admin/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Stock</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={
                                product.images.find((img) => img.isPrimary)
                                  ?.url || "/placeholder-product.jpg"
                              }
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/placeholder-product.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <div
                              className="font-medium line-clamp-1"
                              title={product.name}
                            >
                              {product.name}
                            </div>
                            {product.brand && (
                              <div className="text-sm text-muted-foreground">
                                {product.brand}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {product.category?.name || "No Category"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {formatPrice(product.salePrice || product.basePrice)}
                        </div>
                        {product.salePrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.basePrice)}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-sm ${
                            product.totalStock <= 10
                              ? product.totalStock === 0
                                ? "text-red-600 font-medium"
                                : "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {product.totalStock}{" "}
                          {product.totalStock === 0 ? "(Out of Stock)" : ""}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={product.isActive ? "default" : "secondary"}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {product.featured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Product"
                            asChild
                          >
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Product"
                            asChild
                          >
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              product.isActive
                                ? "Deactivate Product"
                                : "Activate Product"
                            }
                            onClick={() =>
                              toggleProductStatus(
                                product.id,
                                product.isActive,
                              )
                            }
                          >
                            {product.isActive ? "🔒" : "🔓"}
                          </Button>
                          {/* Only allow delete for ADMIN role */}
                          {session?.user?.role === UserRole.ADMIN && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete Product"
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}