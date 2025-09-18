// app/components/admin/products/product-edit-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Switch } from "@/app/components/ui/switch"
import { Badge } from "@/app/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { ProductImageManager } from "./product-image-manager"
import { ProductVariantsManager } from "./product-variants-manager"
import { Save, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  shortDescription?: string | null
  categoryId: number
  brand: string | null
  basePrice: number
  salePrice: number | null
  featured: boolean
  isActive: boolean
  tags: string | null
  metaTitle: string | null
  metaDescription: string | null
  category: Category
  images: any[]
  variants: any[]
  reviewCount: number
  totalStock: number
  createdAt: string
  updatedAt: string
}

interface ProductEditFormProps {
  product: Product
  categories: Category[]
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    categoryId: product.categoryId.toString(),
    brand: product.brand || "",
    basePrice: product.basePrice.toString(),
    salePrice: product.salePrice?.toString() || "",
    featured: product.featured,
    isActive: product.isActive,
    tags: product.tags || "",
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDescription || "",
  })

  const [activeTab, setActiveTab] = useState<"basic" | "images" | "variants" | "seo">("basic")

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Product name is required")
      return
    }

    if (!formData.categoryId) {
      toast.error("Category is required")
      return
    }

    if (!formData.basePrice || isNaN(parseFloat(formData.basePrice))) {
      toast.error("Valid base price is required")
      return
    }

    setLoading(true)
    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        shortDescription: formData.shortDescription.trim() || null,
        categoryId: parseInt(formData.categoryId),
        brand: formData.brand.trim() || null,
        basePrice: parseFloat(formData.basePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        featured: formData.featured,
        isActive: formData.isActive,
        tags: formData.tags.trim() || null,
        metaTitle: formData.metaTitle.trim() || null,
        metaDescription: formData.metaDescription.trim() || null,
      }

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update product")
      }

      toast.success("Product updated successfully!")
      
      // Optionally refresh the page or redirect
      router.refresh()
    } catch (error) {
      console.error("Update product error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "basic", label: "Basic Info", description: "Name, description, pricing" },
    { id: "images", label: "Images", description: `${product.images.length} images` },
    { id: "variants", label: "Variants", description: `${product.variants.length} variants` },
    { id: "seo", label: "SEO", description: "Meta title and description" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date(product.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={product.featured ? "default" : "outline"}>
            {product.featured ? "Featured" : "Not Featured"}
          </Badge>
          <Button 
            form="product-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              <div className="flex flex-col items-center">
                <span>{tab.label}</span>
                <span className="text-xs text-muted-foreground">{tab.description}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "basic" && (
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential product details and identification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange("categoryId", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter detailed product description"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                    placeholder="Brief product summary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Settings</CardTitle>
                <CardDescription>
                  Product pricing and visibility settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price (₹) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) => handleInputChange("basePrice", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price (₹)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.salePrice}
                      onChange={(e) => handleInputChange("salePrice", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-xs text-muted-foreground">
                        Product visibility on storefront
                      </p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Featured Product</Label>
                      <p className="text-xs text-muted-foreground">
                        Show in featured products section
                      </p>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange("featured", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Product Statistics</CardTitle>
              <CardDescription>
                Current product performance and inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{product.totalStock}</div>
                  <div className="text-sm text-muted-foreground">Total Stock</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{product.variants.length}</div>
                  <div className="text-sm text-muted-foreground">Variants</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{product.images.length}</div>
                  <div className="text-sm text-muted-foreground">Images</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{product.reviewCount}</div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {activeTab === "images" && (
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Manage product images and their display order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageManager
              productId={product.id}
              images={product.images}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "variants" && (
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>
              Manage product variants and inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductVariantsManager
              productId={product.id}
              variants={product.variants}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "seo" && (
        <form id="product-form" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your product for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                  placeholder="SEO-friendly title"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                  placeholder="Brief description for search results"
                  rows={3}
                  maxLength={160}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">SEO Preview</h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg">
                    {formData.metaTitle || formData.name}
                  </div>
                  <div className="text-green-700 text-sm">
                    yourstore.com/products/{product.slug}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {formData.metaDescription || formData.shortDescription || formData.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}