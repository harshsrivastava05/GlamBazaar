export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  categoryId: number;
  brand?: string | null;
  basePrice: number; // Always converted to number from Decimal
  salePrice?: number; // Always number or undefined (never null)
  featured: boolean;
  isActive: boolean;
  tags?: string | null;
  averageRating?: number; // Added field
  reviewCount: number; // Added field
  createdAt: string; // Always ISO string after transformation
  updatedAt: string; // Always ISO string after transformation
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  category?: ProductCategory;
}

export interface ProductImage {
  id: number;
  url: string;
  altText: string; // Always string after transformation (never null)
  alt?: string; // For compatibility with some components
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number; // Always converted to number from Decimal
  compareAtPrice?: number; // Always number or undefined (never null)
  stockQuantity: number;
  isActive: boolean;
  variantAttributes: VariantAttribute[];
}

export interface VariantAttribute {
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
}

export interface Review {
  id: number;
  rating: number;
  title?: string; // Always string or undefined (never null)
  content?: string; // Always string or undefined (never null)
  comment?: string; // For backward compatibility
  isApproved: boolean;
  createdAt: string; // Always ISO string after transformation
  user: {
    name: string | null;
    image?: string | null;
  };
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
}

// Cart-related types
export interface CartItem {
  id: number;
  userId: string;
  productId: number;
  variantId?: number | null;
  quantity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  product: {
    id: number;
    name: string;
    slug: string;
    basePrice: number;
    salePrice?: number;
    isActive: boolean;
    images: Array<{
      id: number;
      url: string;
      altText: string;
    }>;
  };
  variant?: {
    id: number;
    sku: string;
    price: number;
    stockQuantity: number;
    isActive: boolean;
    variantAttributes: VariantAttribute[];
  } | null;
}

// Type-safe cart item with guaranteed product
export interface ValidCartItem extends Omit<CartItem, "product"> {
  product: NonNullable<CartItem["product"]>;
}

// Order-related types
export interface Order {
  id: number;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  deliveryType: DeliveryType;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId?: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    images: Array<{
      url: string;
      altText: string;
    }>;
  };
  variant?: {
    id: number;
    sku: string;
  };
}

// Address type
export interface Address {
  id: number;
  userId: string;
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// User types
export interface User {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Wishlist types
export interface WishlistItem {
  id: number;
  userId: string;
  productId: number;
  createdAt: Date | string;
  product: {
    id: number;
    name: string;
    slug: string;
    basePrice: number;
    salePrice?: number;
    images: Array<{
      id: number;
      url: string;
      altText: string;
    }>;
  };
}

// Enums (matching Prisma schema)
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

export enum AddressType {
  HOME = "HOME",
  OFFICE = "OFFICE",
  OTHER = "OTHER",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  UPI = "UPI",
  NET_BANKING = "NET_BANKING",
  COD = "COD",
  DIGITAL_WALLET = "DIGITAL_WALLET",
}

export enum DeliveryType {
  SAME_DAY = "SAME_DAY",
  NEXT_DAY = "NEXT_DAY",
  SPEEDPOST = "SPEEDPOST",
  EXPRESS = "EXPRESS",
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  itemCount: number;
}

export interface ProductFilters {
  featured?: boolean;
  categoryId?: number;
  categoryIds?: number[];
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: "name" | "price" | "created" | "rating";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
}

// Form validation types
export interface CreateOrderData {
  items: Array<{
    productId: number;
    variantId?: number | null;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  deliveryType: DeliveryType;
}

// Type guards
export function isValidCartItem(item: CartItem): item is ValidCartItem {
  return item.product !== null && item.product !== undefined;
}

export function hasVariant(
  item: CartItem
): item is CartItem & { variant: NonNullable<CartItem["variant"]> } {
  return item.variant !== null && item.variant !== undefined;
}
