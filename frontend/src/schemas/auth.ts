import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Register validation schema
export const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(150, 'Username must be less than 150 characters')
    .regex(/^[\w.@+-]+$/, 'Username can only contain letters, numbers, and @/./+/-/_ characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  password_confirm: z
    .string()
    .min(1, 'Please confirm your password'),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(30, 'First name must be less than 30 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(30, 'Last name must be less than 30 characters'),
  phone_number: z
    .string()
    .optional()
    .refine((val) => !val || /^\+254\d{9}$/.test(val), {
      message: 'Phone number must be in format +254XXXXXXXXX',
    }),
  date_of_birth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 16 && age <= 50;
    }, {
      message: 'You must be between 16 and 50 years old',
    }),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .optional(),
  county: z
    .string()
    .optional(),
  sub_county: z
    .string()
    .optional(),
  education_level: z
    .enum(['none', 'primary', 'secondary', 'tertiary', 'university', 'postgraduate'])
    .optional(),
  employment_status: z
    .enum(['employed', 'unemployed', 'seeking_work', 'student', 'self_employed'])
    .optional(),
  preferred_language: z
    .enum(['en', 'sw'])
    .optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(30, 'First name must be less than 30 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(30, 'Last name must be less than 30 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone_number: z
    .string()
    .optional()
    .refine((val) => !val || /^\+254\d{9}$/.test(val), {
      message: 'Phone number must be in format +254XXXXXXXXX',
    }),
  date_of_birth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 16 && age <= 100;
    }, {
      message: 'Please enter a valid date of birth',
    }),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  county: z
    .string()
    .optional(),
  sub_county: z
    .string()
    .optional(),
  address: z
    .string()
    .optional(),
  education_level: z
    .enum(['none', 'primary', 'secondary', 'tertiary', 'university', 'postgraduate'])
    .optional(),
  skills: z
    .string()
    .optional(),
  interests: z
    .string()
    .optional(),
  employment_status: z
    .enum(['employed', 'unemployed', 'seeking_work', 'student', 'self_employed'])
    .optional(),
  preferred_language: z
    .enum(['en', 'sw'])
    .optional(),
  receive_sms_notifications: z
    .boolean()
    .optional(),
  receive_email_notifications: z
    .boolean()
    .optional(),
});

// Change password validation schema
export const changePasswordSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  new_password_confirm: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: "New passwords don't match",
  path: ["new_password_confirm"],
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
