"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Filter, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

interface ProductFiltersProps {
  categories: Category[];
  currentCategoryId?: number; // Add this prop to highlight current category
}

export default function ProductFilters({
  categories,
  currentCategoryId,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  const selectedCategory =
    searchParams.get("category") || currentCategoryId?.toString();
  const selectedSort = searchParams.get("sort") || "created_desc";

  const priceRanges = [
    { label: "Under ₹1,000", min: 0, max: 1000 },
    { label: "₹1,000 - ₹5,000", min: 1000, max: 5000 },
    { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
    { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
    { label: "Above ₹25,000", min: 25000, max: null },
  ];

  const sortOptions = [
    { value: "created_desc", label: "Newest First" },
    { value: "created_asc", label: "Oldest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
  ];

  const brands = [
    "Tiffany & Co",
    "Cartier",
    "Chanel",
    "Charlotte Tilbury",
    "Mikimoto",
    "Harry Winston",
  ];

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Use current pathname to maintain category context
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?${params.toString()}`);
  };

  const updatePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (priceRange.min) {
      params.set("minPrice", priceRange.min);
    } else {
      params.delete("minPrice");
    }

    if (priceRange.max) {
      params.set("maxPrice", priceRange.max);
    } else {
      params.delete("maxPrice");
    }

    const currentPath = window.location.pathname;
    router.push(`${currentPath}?${params.toString()}`);
  };

  const clearFilters = () => {
    setPriceRange({ min: "", max: "" });
    const currentPath = window.location.pathname;
    router.push(currentPath);
  };

  const hasActiveFilters = searchParams.toString() !== "";

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="destructive" className="ml-2">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={cn("space-y-6", "lg:block", isOpen ? "block" : "hidden")}>
        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Sort */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sort By</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={selectedSort === option.value}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Only show category filter if not on a category page */}
        {!currentCategoryId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => updateFilter("category", null)}
                className={cn(
                  "block w-full text-left px-2 py-1 text-sm rounded hover:bg-muted",
                  !selectedCategory && "bg-primary/10 text-primary font-medium"
                )}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() =>
                      updateFilter("category", category.id.toString())
                    }
                    className={cn(
                      "block w-full text-left px-2 py-1 text-sm rounded hover:bg-muted",
                      selectedCategory === category.id.toString() &&
                        "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {category.name}
                  </button>
                  {category.children &&
                    category.children.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() =>
                          updateFilter("category", subcategory.id.toString())
                        }
                        className={cn(
                          "block w-full text-left px-4 py-1 text-sm rounded hover:bg-muted",
                          selectedCategory === subcategory.id.toString() &&
                            "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        {subcategory.name}
                      </button>
                    ))}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Price Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Price Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Ranges */}
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPriceRange({
                      min: range.min.toString(),
                      max: range.max ? range.max.toString() : "",
                    });
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("minPrice", range.min.toString());
                    if (range.max) {
                      params.set("maxPrice", range.max.toString());
                    } else {
                      params.delete("maxPrice");
                    }
                    const currentPath = window.location.pathname;
                    router.push(`${currentPath}?${params.toString()}`);
                  }}
                  className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-muted"
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom Range */}
            <div className="pt-2 border-t space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="text-sm"
                  />
                </div>
              </div>
              <Button size="sm" onClick={updatePriceFilter} className="w-full">
                Apply Price Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Brands */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={brand}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    const currentBrands = params.getAll("brand");

                    if (e.target.checked) {
                      params.append("brand", brand);
                    } else {
                      params.delete("brand");
                      currentBrands
                        .filter((b) => b !== brand)
                        .forEach((b) => {
                          params.append("brand", b);
                        });
                    }

                    const currentPath = window.location.pathname;
                    router.push(`${currentPath}?${params.toString()}`);
                  }}
                  checked={searchParams.getAll("brand").includes(brand)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
