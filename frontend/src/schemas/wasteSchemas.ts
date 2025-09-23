import { z } from 'zod';

// Waste Report Form Schema
export const wasteReportSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  
  category_id: z
    .string()
    .uuid('Please select a valid waste category'),
  
  estimated_weight: z
    .number()
    .min(0.01, 'Weight must be at least 0.01 kg')
    .max(10000, 'Weight must not exceed 10,000 kg'),
  
  location_description: z
    .string()
    .min(10, 'Location description must be at least 10 characters')
    .max(500, 'Location description must not exceed 500 characters'),
  

  
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  

  
  collection_point_id: z
    .string()
    .uuid('Please select a valid collection point')
    .optional(),
  
  photo: z
    .union([
      z.instanceof(File),
      z.instanceof(FileList).transform((fileList) => fileList.length > 0 ? fileList[0] : undefined)
    ])
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024, // 5MB
      'Photo must be smaller than 5MB'
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Photo must be a JPEG, PNG, or WebP image'
    )
});

// Collection Event Form Schema
export const collectionEventSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  
  event_type: z.enum([
    'community_cleanup',
    'beach_cleanup',
    'park_cleanup',
    'school_program',
    'corporate_event'
  ], {
    message: 'Please select a valid event type'
  }),

  location_name: z
    .string()
    .min(10, 'Location name must be at least 10 characters')
    .max(200, 'Location name must not exceed 200 characters'),

  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(255, 'Address must not exceed 255 characters'),
  
  start_datetime: z
    .string()
    .datetime('Please select a valid start date and time')
    .refine(
      (date) => new Date(date) > new Date(),
      'Start date must be in the future'
    ),

  end_datetime: z
    .string()
    .datetime('Please select a valid end date and time'),

  registration_deadline: z
    .string()
    .datetime('Please provide a valid registration deadline')
    .optional(),
  
  max_participants: z
    .number()
    .int('Maximum participants must be a whole number')
    .min(1, 'Must allow at least 1 participant')
    .max(1000, 'Maximum participants cannot exceed 1000')
    .optional(),
  
}).refine(
  (data) => new Date(data.end_datetime) > new Date(data.start_datetime),
  {
    message: 'End date must be after start date',
    path: ['end_datetime']
  }
);

// Location Search Schema
export const locationSearchSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
  
  radius: z
    .number()
    .min(0.1, 'Radius must be at least 0.1 km')
    .max(100, 'Radius cannot exceed 100 km')
    .default(10)
});

// Filter Schemas
export const wasteReportFiltersSchema = z.object({
  status: z.enum(['reported', 'verified', 'collected', 'processed', 'cancelled']).optional(),
  category: z.string().optional(),
  county: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional()
}).refine(
  (data) => {
    if (data.date_from && data.date_to) {
      return new Date(data.date_to) >= new Date(data.date_from);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['date_to']
  }
);

export const collectionEventFiltersSchema = z.object({
  status: z.enum(['planned', 'active', 'completed', 'cancelled']).optional(),
  event_type: z.enum([
    'community_cleanup',
    'beach_cleanup',
    'park_cleanup',
    'school_program',
    'corporate_event'
  ]).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional()
}).refine(
  (data) => {
    if (data.date_from && data.date_to) {
      return new Date(data.date_to) >= new Date(data.date_from);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['date_to']
  }
);

export const creditTransactionFiltersSchema = z.object({
  transaction_type: z.enum(['earned', 'spent', 'bonus', 'penalty', 'adjustment']).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional()
}).refine(
  (data) => {
    if (data.date_from && data.date_to) {
      return new Date(data.date_to) >= new Date(data.date_from);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['date_to']
  }
);

// Update Schemas (for staff)
export const wasteReportUpdateSchema = z.object({
  status: z.enum(['reported', 'verified', 'collected', 'processed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  actual_weight_kg: z
    .number()
    .min(0.01, 'Weight must be at least 0.01 kg')
    .max(10000, 'Weight must not exceed 10,000 kg')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  collection_point_id: z
    .string()
    .uuid('Please select a valid collection point')
    .optional()
});

// Validation Helper Types
export type WasteReportFormData = z.infer<typeof wasteReportSchema>;
export type CollectionEventFormData = z.infer<typeof collectionEventSchema>;
export type LocationSearchData = z.infer<typeof locationSearchSchema>;
export type WasteReportFiltersData = z.infer<typeof wasteReportFiltersSchema>;
export type CollectionEventFiltersData = z.infer<typeof collectionEventFiltersSchema>;
export type CreditTransactionFiltersData = z.infer<typeof creditTransactionFiltersSchema>;
export type WasteReportUpdateData = z.infer<typeof wasteReportUpdateSchema>;

// Custom validation functions
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const validateImageType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  return new Date(endDate) > new Date(startDate);
};

export const validateFutureDate = (date: string): boolean => {
  return new Date(date) > new Date();
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

// Kisumu sub-counties for specific validation
export const kisumuSubCounties = [
  'Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach'
];

export const validateKisumuSubCounty = (subCounty: string): boolean => {
  return kisumuSubCounties.includes(subCounty);
};
