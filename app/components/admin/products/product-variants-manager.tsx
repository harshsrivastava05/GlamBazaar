// app/components/admin/products/product-variants-manager.tsx
"use client"

import { useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface ProductVariant {
  id: number
  sku: string
  price: number
  stockQuantity: number
  isActive: boolean
}

interface ProductVariantsManagerProps {
  productId: number
  variants: ProductVariant[]
}

export function ProductVariantsManager({ productId, variants: initialVariants }: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState(initialVariants)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    sku: "",
    price: "",
    stockQuantity: "",
    isActive: true,
  })

  const resetForm = () => {
    setFormData({
      sku: "",
      price: "",
      stockQuantity: "",
      isActive: true,
    })
    setEditingVariant(null)
  }

  const openEditDialog = (variant: ProductVariant) => {
    setEditingVariant(variant)
    setFormData({
      sku: variant.sku,
      price: variant.price.toString(),
      stockQuantity: variant.stockQuantity.toString(),
      isActive: variant.isActive,
    })
    setIsAddDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.sku.trim()) {
      toast.error("SKU is required")
      return
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      toast.error("Valid price is required")
      return
    }

    if (!formData.stockQuantity || isNaN(parseInt(formData.stockQuantity))) {
      toast.error("Valid stock quantity is required")
      return
    }

    setLoading(true)
    try {
      const url = editingVariant
        ? `/api/admin/products/${productId}/variants/${editingVariant.id}`
        : `/api/admin/products/${productId}/variants`
      
      const method = editingVariant ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: formData.sku.trim().toUpperCase(),
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity),
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save variant")
      }

      const savedVariant = await response.json()

      if (editingVariant) {
        setVariants(prev =>
          prev.map(v => (v.id === editingVariant.id ? savedVariant : v))
        )
        toast.success("Variant updated successfully!")
      } else {
        setVariants(prev => [...prev, savedVariant])
        toast.success("Variant added successfully!")
      }

      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Save variant error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save variant")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (variantId: number) => {
    if (!confirm("Are you sure you want to delete this variant?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete variant")
      }

      setVariants(prev => prev.filter(v => v.id !== variantId))
      toast.success("Variant deleted successfully!")
    } catch (error) {
      console.error("Delete variant error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete variant")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickStockUpdate = async (variantId: number, newStock: number) => {
    if (newStock < 0) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newStock }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update stock")
      }

      const updatedVariant = await response.json()
      setVariants(prev =>
        prev.map(v => (v.id === variantId ? updatedVariant : v))
      )
      toast.success("Stock updated!")
    } catch (error) {
      console.error("Stock update error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update stock")
    } finally {
      setLoading(false)
    }
  }

  const totalStock = variants.reduce((sum, v) => sum + (v.isActive ? v.stockQuantity : 0), 0)
  const activeVariants = variants.filter(v => v.isActive).length
  const lowStockVariants = variants.filter(v => v.isActive && v.stockQuantity <= 5).length

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">{variants.length}</div>
          <div className="text-xs text-muted-foreground">Total Variants</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">{activeVariants}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">{totalStock}</div>
          <div className="text-xs text-muted-foreground">Total Stock</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold text-orange-600">{lowStockVariants}</div>
          <div className="text-xs text-muted-foreground">Low Stock</div>
        </div>
      </div>

      {/* Add Variant Button */}
      <div className="flex justify-end">
        <Dialog 
          open={isAddDialogOpen} 
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? "Edit Variant" : "Add New Variant"}
              </DialogTitle>
              <DialogDescription>
                {editingVariant ? "Update variant details" : "Create a new product variant"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="PRODUCT-SIZE-COLOR"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : editingVariant ? "Update" : "Add"} Variant
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Variants Table */}
      {variants.length === 0 ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Package className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            No variants created yet. Add your first variant to get started.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Variants</CardTitle>
            <CardDescription>
              Manage individual product variants and their inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          {variant.sku}
                          {variant.stockQuantity <= 5 && variant.stockQuantity > 0 && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          {variant.stockQuantity === 0 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>₹{variant.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={variant.stockQuantity}
                            onChange={(e) => {
                              const newStock = parseInt(e.target.value) || 0
                              handleQuickStockUpdate(variant.id, newStock)
                            }}
                            className="w-20 h-8"
                            disabled={loading}
                          />
                          <Badge
                            variant={
                              variant.stockQuantity === 0
                                ? "destructive"
                                : variant.stockQuantity <= 5
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {variant.stockQuantity === 0
                              ? "Out of Stock"
                              : variant.stockQuantity <= 5
                              ? "Low Stock"
                              : "In Stock"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant.isActive ? "default" : "secondary"}>
                          {variant.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(variant)}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(variant.id)}
                            disabled={loading || variants.length === 1}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}