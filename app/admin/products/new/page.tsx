"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import { useToast } from "@/app/components/ui/use-toast";

export default function AdminProductNewPage() {
  const { status, data } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<string>("0");
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<{ url: string; altText?: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated")
      router.push("/login?callbackUrl=/admin/products/new");
  }, [status, router]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/categories?includeInactive=true");
      if (res.ok) setCategories(await res.json());
    };
    load();
  }, []);

  const addImage = () => setImages((prev) => [...prev, { url: "" }]);
  const updateImage = (idx: number, key: "url" | "altText", val: string) =>
    setImages((prev) =>
      prev.map((im, i) => (i === idx ? { ...im, [key]: val } : im))
    );
  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async () => {
    if (!name || !categoryId || !basePrice) {
      toast({
        title: "Missing fields",
        description: "Name, category and base price are required",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand,
          categoryId: Number(categoryId),
          description,
          shortDescription,
          basePrice: Number(basePrice),
          salePrice: salePrice ? Number(salePrice) : undefined,
          stockQuantity: Number(stockQuantity || "0"),
          featured,
          isActive,
          tags: tags || undefined,
          images: images.filter((i) => i.url),
        }),
      });
      if (res.ok) {
        toast({ title: "Product created" });
        router.push("/admin/products");
      } else {
        const e = await res.json();
        toast({
          title: "Error",
          description: e.error || "Failed to create product",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Product</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem value={String(c.id)} key={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shortDesc">Short Description</Label>
            <Input
              id="shortDesc"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price *</Label>
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="salePrice">Sale Price</Label>
              <Input
                id="salePrice"
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock (default variant)</Label>
              <Input
                id="stock"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between border rounded p-3">
              <div>
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Highlight on storefront
                </p>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
            <div className="flex items-center justify-between border rounded p-3">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Visible to customers
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Images</Label>
              <Button variant="outline" onClick={addImage}>
                Add image
              </Button>
            </div>
            <div className="space-y-3">
              {images.map((im, idx) => (
                <div className="grid md:grid-cols-3 gap-3" key={idx}>
                  <Input
                    placeholder="Image URL"
                    value={im.url}
                    onChange={(e) => updateImage(idx, "url", e.target.value)}
                  />
                  <Input
                    placeholder="Alt text"
                    value={im.altText || ""}
                    onChange={(e) =>
                      updateImage(idx, "altText", e.target.value)
                    }
                  />
                  <Button variant="outline" onClick={() => removeImage(idx)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? "Saving..." : "Create Product"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
