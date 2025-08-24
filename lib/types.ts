export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  categoryId: number;
  brand?: string | null;
  basePrice: number;
  salePrice?: number | null;
  featured: boolean;
  isActive: boolean;
  tags?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Fixed: altText is now always a string (never null/undefined) after transformation
  images: Array<{
    id: number;
    url: string;
    altText: string; // Changed from string | null to string
    isPrimary: boolean;
    sortOrder: number;
  }>;
  variants: Array<{
    id: number;
    sku: string;
    price: number;
    compareAtPrice?: number | null;
    stockQuantity: number;
    isActive: boolean;
    variantAttributes: Array<{
      id: number;
      attributeId: number;
      attributeOptionId: number;
      attribute: {
        id: number;
        name: string;
        type: string;
        displayName: string;
      };
      attributeOption: {
        id: number;
        value: string;
        displayValue: string;
        colorHex?: string | null;
      };
    }>;
  }>;
  reviews: Array<{
    id: number;
    rating: number;
    title?: string | null;
    comment?: string | null;
    verifiedPurchase: boolean;
    isApproved: boolean;
    createdAt: string | Date;
    user: {
      name: string | null;
      image?: string | null;
    };
  }>;
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    parentId?: number | null;
  };
}
export interface ProductImage {
  id: number;
  url: string;
  altText: string; 
  sortOrder: number;
  isPrimary: boolean;
}
