export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  categoryId: number;
  brand?: string | null;
  basePrice: number;
  salePrice?: number; // undefined, not null
  featured: boolean;
  isActive: boolean;
  tags?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Fixed: altText is now always a string (never null/undefined) after transformation
  images: Array<{
    id: number;
    url: string;
    altText: string; // Always a string after transformation
    alt?: string; // Add this for compatibility with related-products component
    isPrimary: boolean;
    sortOrder: number;
  }>;
  variants: Array<{
    id: number;
    sku: string;
    price: number;
    compareAtPrice?: number; // undefined, not null
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
    title?: string; // undefined, not null
    comment?: string; // undefined, not null
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

// Add these interfaces to match your component expectations
export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  compareAtPrice?: number; // undefined, not null
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
}

export interface Review {
  id: number;
  rating: number;
  title?: string; // undefined, not null
  comment?: string; // undefined, not null
  verifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string | Date;
  user: {
    name: string | null;
    image?: string | null;
  };
}