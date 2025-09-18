import { z } from 'zod';

// Product Search Schema
export const productSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().uuid().optional(),
  vendor: z.string().uuid().optional(),
  min_price: z
    .number()
    .min(0, 'Minimum price must be at least 0')
    .optional(),
  max_price: z
    .number()
    .min(0, 'Maximum price must be at least 0')
    .optional(),
  county: z.string().optional(),
  in_stock: z.boolean().optional(),
  recyclable: z.boolean().optional(),
  biodegradable: z.boolean().optional(),
  ordering: z.string().optional(),
}).refine(
  (data) => {
    if (data.min_price && data.max_price) {
      return data.max_price >= data.min_price;
    }
    return true;
  },
  {
    message: 'Maximum price must be greater than or equal to minimum price',
    path: ['max_price']
  }
);

// Add to Cart Schema
export const addToCartSchema = z.object({
  product_id: z
    .string()
    .uuid('Please select a valid product'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100 items')
});

// Update Cart Item Schema
export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity must be at least 0')
    .max(100, 'Quantity cannot exceed 100 items')
});

// Product Review Schema
export const productReviewSchema = z.object({
  product: z
    .string()
    .uuid('Please select a valid product'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  title: z
    .string()
    .min(5, 'Review title must be at least 5 characters')
    .max(200, 'Review title must not exceed 200 characters'),
  comment: z
    .string()
    .min(10, 'Review comment must be at least 10 characters')
    .max(2000, 'Review comment must not exceed 2000 characters')
});

// Order Creation Schema
export const orderCreateSchema = z.object({
  payment_method: z.enum(['credits', 'mpesa', 'bank_transfer', 'cash_on_delivery', 'mixed'], {
    message: 'Please select a valid payment method'
  }),
  delivery_address: z
    .string()
    .min(10, 'Delivery address must be at least 10 characters')
    .max(500, 'Delivery address must not exceed 500 characters'),
  delivery_county: z
    .string()
    .min(2, 'Delivery county is required')
    .max(100, 'County name too long'),
  delivery_sub_county: z
    .string()
    .max(100, 'Sub-county name too long')
    .optional(),
  delivery_phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number'),
  delivery_instructions: z
    .string()
    .max(500, 'Delivery instructions must not exceed 500 characters')
    .optional(),
  customer_notes: z
    .string()
    .max(1000, 'Customer notes must not exceed 1000 characters')
    .optional(),
  items: z
    .array(z.object({
      product_id: z.string().uuid('Invalid product ID'),
      quantity: z
        .number()
        .int('Quantity must be a whole number')
        .min(1, 'Quantity must be at least 1')
    }))
    .min(1, 'Order must contain at least one item')
    .max(50, 'Order cannot contain more than 50 different items')
});

// Product Filters Schema
export const productFiltersSchema = z.object({
  category: z.string().uuid().optional(),
  vendor: z.string().uuid().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  county: z.string().optional(),
  in_stock: z.boolean().optional(),
  recyclable: z.boolean().optional(),
  biodegradable: z.boolean().optional(),
  search: z.string().optional(),
  ordering: z.enum([
    'name', '-name',
    'price', '-price',
    'average_rating', '-average_rating',
    'total_sales', '-total_sales',
    'created_at', '-created_at'
  ]).optional()
}).refine(
  (data) => {
    if (data.min_price && data.max_price) {
      return data.max_price >= data.min_price;
    }
    return true;
  },
  {
    message: 'Maximum price must be greater than or equal to minimum price',
    path: ['max_price']
  }
);

// Vendor Filters Schema
export const vendorFiltersSchema = z.object({
  county: z.string().optional(),
  business_type: z.enum([
    'sole_proprietorship',
    'partnership', 
    'limited_company',
    'cooperative',
    'ngo',
    'other'
  ]).optional(),
  search: z.string().optional(),
  ordering: z.enum([
    'business_name', '-business_name',
    'average_rating', '-average_rating',
    'total_sales', '-total_sales',
    'created_at', '-created_at'
  ]).optional()
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z
    .number()
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .optional(),
  page_size: z
    .number()
    .int('Page size must be a whole number')
    .min(1, 'Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100')
    .optional()
});

// Contact Information Schema (for checkout)
export const contactInfoSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number')
});

// Validation Helper Types
export type ProductSearchData = z.infer<typeof productSearchSchema>;
export type AddToCartData = z.infer<typeof addToCartSchema>;
export type UpdateCartItemData = z.infer<typeof updateCartItemSchema>;
export type ProductReviewData = z.infer<typeof productReviewSchema>;
export type OrderCreateData = z.infer<typeof orderCreateSchema>;
export type ProductFiltersData = z.infer<typeof productFiltersSchema>;
export type VendorFiltersData = z.infer<typeof vendorFiltersSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
export type ContactInfoData = z.infer<typeof contactInfoSchema>;

// Custom validation functions
export const validatePrice = (price: number): boolean => {
  return price >= 0 && price <= 1000000; // Max 1M KSh
};

export const validateQuantity = (quantity: number, maxStock?: number): boolean => {
  if (maxStock !== undefined) {
    return quantity >= 1 && quantity <= maxStock;
  }
  return quantity >= 1 && quantity <= 100;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 15;
};

export const validateRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

// Kenya-specific validation
export const kenyaCounties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export const validateKenyaCounty = (county: string): boolean => {
  return kenyaCounties.includes(county);
};

// Payment method validation
export const paymentMethods = [
  'credits', 'mpesa', 'bank_transfer', 'cash_on_delivery', 'mixed'
] as const;

export const validatePaymentMethod = (method: string): boolean => {
  return paymentMethods.includes(method as any);
};

// Business type validation
export const businessTypes = [
  'sole_proprietorship', 'partnership', 'limited_company', 
  'cooperative', 'ngo', 'other'
] as const;

export const validateBusinessType = (type: string): boolean => {
  return businessTypes.includes(type as any);
};
