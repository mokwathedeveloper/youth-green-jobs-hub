/**
 * Contact/Support Form Component
 * 
 * A reusable contact form with SDG theming, validation,
 * and accessibility features for user inquiries and support.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, User, Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import type { SDGTheme } from '../../types/sdg';
import { getSDGTailwindClasses } from '../../config/sdgThemes';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { clsx } from 'clsx';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.enum(['general', 'support', 'partnership', 'feedback', 'bug-report']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  theme?: SDGTheme;
  onSubmit: (data: ContactFormData) => Promise<void>;
  className?: string;
  showPriority?: boolean;
  defaultCategory?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({
  theme = 'cities',
  onSubmit,
  className = '',
  showPriority = false,
  defaultCategory = 'general',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tailwindClasses = getSDGTailwindClasses(theme);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      category: defaultCategory as any,
      priority: 'medium',
    },
  });

  const categoryOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'bug-report', label: 'Bug Report' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ];

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={clsx(
      'bg-white rounded-lg shadow-md p-6 border-l-4',
      tailwindClasses.border.primary,
      className
    )}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={clsx(
            'p-2 rounded-lg',
            tailwindClasses.bg.light
          )}>
            <MessageSquare className={clsx('w-5 h-5', tailwindClasses.text.primary)} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Contact Us
          </h2>
        </div>
        <p className="text-gray-600">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      {/* Contact info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-600">info@youthgreenjobs.ke</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Phone className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Phone</p>
            <p className="text-sm text-gray-600">+254 700 000 000</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <MapPin className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Location</p>
            <p className="text-sm text-gray-600">Kisumu, Kenya</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name and Email row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            error={errors.name?.message}
            icon={<User className="w-4 h-4" />}
            {...register('name')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            icon={<Mail className="w-4 h-4" />}
            {...register('email')}
          />
        </div>

        {/* Phone and Category row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone Number (Optional)"
            type="tel"
            placeholder="Enter your phone number"
            error={errors.phone?.message}
            icon={<Phone className="w-4 h-4" />}
            {...register('phone')}
          />
          <Select
            label="Category"
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />
        </div>

        {/* Subject and Priority row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Subject"
            type="text"
            placeholder="Brief description of your inquiry"
            error={errors.subject?.message}
            {...register('subject')}
          />
          {showPriority && (
            <Select
              label="Priority"
              options={priorityOptions}
              error={errors.priority?.message}
              {...register('priority')}
            />
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            rows={5}
            placeholder="Please provide details about your inquiry..."
            className={clsx(
              'block w-full px-3 py-2 border rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm',
              'transition-colors resize-vertical',
              errors.message
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : clsx('border-gray-300', tailwindClasses.ring.primary, 'focus:border-green-500')
            )}
            {...register('message')}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className={clsx(
              'px-6 py-2 flex items-center gap-2',
              tailwindClasses.bg.primary,
              tailwindClasses.bg.primaryHover
            )}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </form>

      {/* Footer note */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Response Time:</strong> We typically respond within 24 hours during business days. 
          For urgent matters, please call us directly.
        </p>
      </div>
    </div>
  );
};

export default ContactForm;
