/**
 * Utility functions for formatting data
 */

/**
 * Format price with proper error handling for string/number conversion
 * @param price - Price value (can be number or string)
 * @param currency - Currency code (default: 'KES')
 * @param locale - Locale for formatting (default: 'en-KE')
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number | string, 
  currency: string = 'KES', 
  locale: string = 'en-KE'
): string => {
  // Convert to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if the conversion resulted in a valid number
  if (isNaN(numericPrice)) {
    console.warn('Invalid price value:', price);
    return `${currency === 'KES' ? 'KSh' : currency} 0`;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numericPrice);
};

/**
 * Format date with proper error handling
 * @param dateString - Date string to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-KE', options);
  } catch (error) {
    console.warn('Invalid date string:', dateString);
    return 'Invalid Date';
  }
};

/**
 * Format number with proper error handling
 * @param value - Number value (can be number or string)
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number | string,
  options: Intl.NumberFormatOptions = {}
): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    console.warn('Invalid number value:', value);
    return '0';
  }
  
  return new Intl.NumberFormat('en-KE', options).format(numericValue);
};

/**
 * Format percentage with proper error handling
 * @param value - Percentage value (can be number or string)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | string,
  decimals: number = 1
): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    console.warn('Invalid percentage value:', value);
    return '0%';
  }
  
  return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Format file size in human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle Kenyan phone numbers
  if (cleaned.startsWith('254')) {
    // Format as +254 XXX XXX XXX
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  } else if (cleaned.startsWith('0')) {
    // Format as 0XXX XXX XXX
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  
  return phone; // Return original if format not recognized
};

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Format address for display
 * @param address - Address object or string
 * @returns Formatted address string
 */
export const formatAddress = (address: any): string => {
  if (typeof address === 'string') return address;
  
  const parts = [
    address.street,
    address.city,
    address.county,
    address.postal_code
  ].filter(Boolean);
  
  return parts.join(', ');
};
