// app/components/admin/products/product-image-manager.tsx
"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { Badge } from "@/app/components/ui/badge"
import {
  Plus,
  Trash2,
  Star,
  Upload,
  ExternalLink,
  MoveUp,
  MoveDown,
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ProductImage {
  id: number
  url: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

interface ProductImageManagerProps {
  productId: number
  images: ProductImage[]
}

export function ProductImageManager({ productId, images: initialImages }: ProductImageManagerProps) {
  const [images, setImages] = useState(initialImages)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageAlt, setNewImageAlt] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error("Image URL is required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newImageUrl.trim(),
          altText: newImageAlt.trim() || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add image")
      }

      const newImage = await response.json()
      setImages(prev => [...prev, newImage])
      setNewImageUrl("")
      setNewImageAlt("")
      setIsAddDialogOpen(false)
      toast.success("Image added successfully!")
    } catch (error) {
      console.error("Add image error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add image")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete image")
      }

      setImages(prev => prev.filter(img => img.id !== imageId))
      toast.success("Image deleted successfully!")
    } catch (error) {
      console.error("Delete image error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete image")
    } finally {
      setLoading(false)
    }
  }

  const handleSetPrimary = async (imageId: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}/primary`, {
        method: "PUT",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to set primary image")
      }

      setImages(prev =>
        prev.map(img => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      )
      toast.success("Primary image updated!")
    } catch (error) {
      console.error("Set primary error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to set primary image")
    } finally {
      setLoading(false)
    }
  }

  const moveImage = async (imageId: number, direction: "up" | "down") => {
    const currentIndex = images.findIndex(img => img.id === imageId)
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === images.length - 1)
    ) {
      return
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const newImages = [...images]
    const [movedImage] = newImages.splice(currentIndex, 1)
    newImages.splice(newIndex, 0, movedImage)

    // Update sort orders
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sortOrder: index,
    }))

    setImages(updatedImages)

    // Save to server
    try {
      await fetch(`/api/admin/products/${productId}/images/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: updatedImages.map(img => ({
            id: img.id,
            sortOrder: img.sortOrder,
          })),
        }),
      })
      toast.success("Image order updated!")
    } catch (error) {
      console.error("Reorder error:", error)
      toast.error("Failed to save image order")
      // Revert on error
      setImages(images)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {images.length} image{images.length !== 1 ? "s" : ""}
        </p>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product Image</DialogTitle>
              <DialogDescription>
                Add a new image to this product
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageAlt">Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                  placeholder="Description of the image"
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
                <Button onClick={handleAddImage} disabled={loading}>
                  {loading ? "Adding..." : "Add Image"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            No images added yet. Add your first image to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative border rounded-lg overflow-hidden bg-muted/30"
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.altText || `Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-image.png" // Fallback image
                  }}
                />
                
                {image.isPrimary && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                    <Star className="h-3 w-3 mr-1" />
                    Primary
                  </Badge>
                )}
              </div>

              <div className="p-3 space-y-2">
                <p className="text-xs text-muted-foreground truncate">
                  {image.altText || "No alt text"}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveImage(image.id, "up")}
                      disabled={index === 0 || loading}
                      className="h-7 w-7 p-0"
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveImage(image.id, "down")}
                      disabled={index === images.length - 1 || loading}
                      className="h-7 w-7 p-0"
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(image.url, "_blank")}
                      className="h-7 w-7 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    
                    {!image.isPrimary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetPrimary(image.id)}
                        disabled={loading}
                        className="h-7 w-7 p-0"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={loading}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}