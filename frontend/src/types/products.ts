// Eco Products Types for Youth Green Jobs Hub

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface SMEVendor {
  id: string;
  business_name: string;
  business_registration_number?: string;
  business_type: 'sole_proprietorship' | 'partnership' | 'limited_company' | 'cooperative' | 'ngo' | 'other';
  description: string;
  owner: User;
  contact_email: string;
  contact_phone: string;
  address: string;
  county: string;
  sub_county?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  logo?: string;
  is_verified: boolean;
  eco_certifications_list: string[];
  sustainability_practices?: string;
  average_rating: number;
  total_sales: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface SMEVendorListItem {
  id: string;
  business_name: string;
  business_type: string;
  description: string;
  owner: User;
  county: string;
  sub_county?: string;
  logo?: string;
  is_verified: boolean;
  eco_certifications_list: string[];
  average_rating: number;
  total_sales: number;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  parent?: string;
  subcategories: ProductCategory[];
  product_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  image: string;
  alt_text: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  vendor: SMEVendorListItem;
  category: ProductCategory;
  price: number;
  credit_price?: number;
  discount_percentage: number;
  discounted_price: number;
  stock_quantity: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  sku?: string;
  weight_kg?: number;
  dimensions?: string;
  eco_friendly_features: string;
  materials: string;
  recyclable: boolean;
  biodegradable: boolean;
  carbon_footprint_kg?: number;
  featured_image: string;
  images: ProductImage[];
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  tags_list: string[];
  view_count: number;
  total_sales: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  vendor: SMEVendorListItem;
  category: ProductCategory;
  price: number;
  credit_price?: number;
  discount_percentage: number;
  discounted_price: number;
  featured_image: string;
  is_in_stock: boolean;
  is_featured: boolean;
  average_rating: number;
  total_sales: number;
  tags_list: string[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  product: ProductListItem;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer: User;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_method: 'credits' | 'mpesa' | 'bank_transfer' | 'cash_on_delivery' | 'mixed';
  total_amount: number;
  credits_used: number;
  cash_amount: number;
  items: OrderItem[];
  delivery_address: string;
  delivery_county: string;
  delivery_sub_county?: string;
  delivery_phone: string;
  delivery_instructions?: string;
  tracking_number?: string;
  customer_notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  customer: User;
  status: string;
  payment_method: string;
  total_amount: number;
  credits_used: number;
  item_count: number;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product: ProductListItem;
  customer: User;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  product: ProductListItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  added_at: string;
  updated_at: string;
}

export interface ShoppingCart {
  id: string;
  customer: User;
  items: CartItem[];
  total_items: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// Form Data Types
export interface ProductFilters {
  category?: string;
  vendor?: string;
  min_price?: number;
  max_price?: number;
  county?: string;
  in_stock?: boolean;
  recyclable?: boolean;
  biodegradable?: boolean;
  search?: string;
  ordering?: string;
}

export interface OrderCreateData {
  payment_method: 'credits' | 'mpesa' | 'bank_transfer' | 'cash_on_delivery' | 'mixed';
  delivery_address: string;
  delivery_county: string;
  delivery_sub_county?: string;
  delivery_phone: string;
  delivery_instructions?: string;
  customer_notes?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export interface ReviewCreateData {
  product: string;
  rating: number;
  title: string;
  comment: string;
}

export interface AddToCartData {
  product_id: string;
  quantity: number;
}

// API Response Types
export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductListItem[];
}

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderListItem[];
}

export interface ReviewListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductReview[];
}

export interface VendorListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SMEVendorListItem[];
}

export interface ProductRecommendations {
  similar_products: ProductListItem[];
  vendor_products: ProductListItem[];
}

export interface DashboardStats {
  total_products: number;
  total_vendors: number;
  total_categories: number;
  featured_products: number;
  user_orders?: number;
  cart_items?: number;
}

// Utility Types
export type PaymentMethod = 'credits' | 'mpesa' | 'bank_transfer' | 'cash_on_delivery' | 'mixed';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type BusinessType = 'sole_proprietorship' | 'partnership' | 'limited_company' | 'cooperative' | 'ngo' | 'other';

export interface ProductSearchParams {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  county?: string;
  eco_friendly?: string;
  in_stock?: boolean;
  page?: string;
  page_size?: string;
  ordering?: string;
}

// Error Types
export interface ProductAPIError {
  message: string;
  field?: string;
  code?: string;
}

export interface ValidationError {
  [key: string]: string[];
}
