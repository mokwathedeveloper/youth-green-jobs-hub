/**
 * Configuration utilities for Youth Green Jobs Hub Frontend
 * 
 * This module provides centralized access to environment variables
 * and configuration settings for the React application.
 */

// ===== API CONFIGURATION =====
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  TIMEOUT_MS: parseInt(import.meta.env.VITE_API_TIMEOUT_MS || '30000', 10),
  get FULL_BASE_URL() {
    return `${this.BASE_URL}/api/${this.VERSION}`;
  }
} as const;

// ===== APP CONFIGURATION =====
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Youth Green Jobs Hub',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Connecting youth with green jobs and eco-friendly opportunities',
} as const;

// ===== FEATURE FLAGS =====
export const FEATURES = {
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  GEOLOCATION: import.meta.env.VITE_ENABLE_GEOLOCATION !== 'false', // Default to true
} as const;

// ===== GEOLOCATION CONFIGURATION =====
export const GEOLOCATION_CONFIG = {
  DEFAULT_LATITUDE: parseFloat(import.meta.env.VITE_DEFAULT_LATITUDE || '-0.0917'),
  DEFAULT_LONGITUDE: parseFloat(import.meta.env.VITE_DEFAULT_LONGITUDE || '34.7680'),
  TIMEOUT_MS: parseInt(import.meta.env.VITE_GEOLOCATION_TIMEOUT_MS || '10000', 10),
  MAX_AGE_MS: parseInt(import.meta.env.VITE_GEOLOCATION_MAX_AGE_MS || '300000', 10),
  HIGH_ACCURACY: import.meta.env.VITE_GEOLOCATION_HIGH_ACCURACY !== 'false', // Default to true
  get DEFAULT_COORDINATES() {
    return {
      latitude: this.DEFAULT_LATITUDE,
      longitude: this.DEFAULT_LONGITUDE,
    };
  },
  get OPTIONS() {
    return {
      enableHighAccuracy: this.HIGH_ACCURACY,
      timeout: this.TIMEOUT_MS,
      maximumAge: this.MAX_AGE_MS,
    };
  }
} as const;

// ===== UI CONFIGURATION =====
export const UI_CONFIG = {
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20', 10),
  MAX_FILE_SIZE_MB: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '10', 10),
  SUPPORTED_IMAGE_FORMATS: (import.meta.env.VITE_SUPPORTED_IMAGE_FORMATS || 'jpg,jpeg,png,webp').split(','),
  SUPPORTED_DOCUMENT_FORMATS: (import.meta.env.VITE_SUPPORTED_DOCUMENT_FORMATS || 'pdf,doc,docx').split(','),
  get MAX_FILE_SIZE_BYTES() {
    return this.MAX_FILE_SIZE_MB * 1024 * 1024;
  }
} as const;

// ===== PLATFORM CONFIGURATION =====
export const PLATFORM_CONFIG = {
  DEFAULT_COUNTY: import.meta.env.VITE_DEFAULT_COUNTY || 'Kisumu',
  DEFAULT_COUNTRY: import.meta.env.VITE_DEFAULT_COUNTRY || 'Kenya',
  TIMEZONE: import.meta.env.VITE_PLATFORM_TIMEZONE || 'Africa/Nairobi',
} as const;

// ===== EXTERNAL SERVICES =====
export const EXTERNAL_SERVICES = {
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  FIREBASE_CONFIG: import.meta.env.VITE_FIREBASE_CONFIG || '',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID || '',
} as const;

// ===== VALIDATION UTILITIES =====
export const validateFileSize = (file: File): boolean => {
  return file.size <= UI_CONFIG.MAX_FILE_SIZE_BYTES;
};

export const validateImageFormat = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return UI_CONFIG.SUPPORTED_IMAGE_FORMATS.includes(extension);
};

export const validateDocumentFormat = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return UI_CONFIG.SUPPORTED_DOCUMENT_FORMATS.includes(extension);
};

export const getFileValidationError = (file: File, type: 'image' | 'document'): string | null => {
  if (!validateFileSize(file)) {
    return `File size must be less than ${UI_CONFIG.MAX_FILE_SIZE_MB}MB`;
  }
  
  if (type === 'image' && !validateImageFormat(file)) {
    return `Supported image formats: ${UI_CONFIG.SUPPORTED_IMAGE_FORMATS.join(', ')}`;
  }
  
  if (type === 'document' && !validateDocumentFormat(file)) {
    return `Supported document formats: ${UI_CONFIG.SUPPORTED_DOCUMENT_FORMATS.join(', ')}`;
  }
  
  return null;
};

// ===== GEOLOCATION UTILITIES =====
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!FEATURES.GEOLOCATION || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported or disabled'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      GEOLOCATION_CONFIG.OPTIONS
    );
  });
};

export const getDefaultLocation = () => {
  return GEOLOCATION_CONFIG.DEFAULT_COORDINATES;
};

// ===== CONFIGURATION VALIDATION =====
export const validateConfiguration = (): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate API configuration
  if (!API_CONFIG.BASE_URL) {
    errors.push('API base URL is not configured');
  }

  if (API_CONFIG.TIMEOUT_MS <= 0) {
    errors.push('API timeout must be positive');
  }

  // Validate geolocation configuration
  if (GEOLOCATION_CONFIG.DEFAULT_LATITUDE < -90 || GEOLOCATION_CONFIG.DEFAULT_LATITUDE > 90) {
    errors.push('Default latitude must be between -90 and 90');
  }

  if (GEOLOCATION_CONFIG.DEFAULT_LONGITUDE < -180 || GEOLOCATION_CONFIG.DEFAULT_LONGITUDE > 180) {
    errors.push('Default longitude must be between -180 and 180');
  }

  if (GEOLOCATION_CONFIG.TIMEOUT_MS <= 0) {
    errors.push('Geolocation timeout must be positive');
  }

  // Validate UI configuration
  if (UI_CONFIG.DEFAULT_PAGE_SIZE <= 0) {
    errors.push('Default page size must be positive');
  }

  if (UI_CONFIG.MAX_FILE_SIZE_MB <= 0) {
    errors.push('Max file size must be positive');
  }

  // Warnings for missing optional configurations
  if (!EXTERNAL_SERVICES.GOOGLE_MAPS_API_KEY && FEATURES.GEOLOCATION) {
    warnings.push('Google Maps API key not configured - map features may be limited');
  }

  if (!EXTERNAL_SERVICES.ANALYTICS_ID && FEATURES.ANALYTICS) {
    warnings.push('Analytics ID not configured - analytics features disabled');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// ===== DEVELOPMENT UTILITIES =====
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || FEATURES.DEBUG;
};

export const logConfiguration = (): void => {
  if (!isDevelopment()) return;

  console.group('🔧 Application Configuration');
  console.log('API Config:', API_CONFIG);
  console.log('App Config:', APP_CONFIG);
  console.log('Features:', FEATURES);
  console.log('Geolocation Config:', GEOLOCATION_CONFIG);
  console.log('UI Config:', UI_CONFIG);
  console.log('Platform Config:', PLATFORM_CONFIG);
  console.groupEnd();

  const validation = validateConfiguration();
  if (!validation.valid) {
    console.group('❌ Configuration Errors');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  if (validation.warnings.length > 0) {
    console.group('⚠️ Configuration Warnings');
    validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
};

// Auto-validate configuration in development
if (isDevelopment()) {
  const validation = validateConfiguration();
  if (!validation.valid) {
    console.error('Configuration validation failed:', validation.errors);
  }
}

// Export all configurations as a single object for convenience
export const CONFIG = {
  API: API_CONFIG,
  APP: APP_CONFIG,
  FEATURES,
  GEOLOCATION: GEOLOCATION_CONFIG,
  UI: UI_CONFIG,
  PLATFORM: PLATFORM_CONFIG,
  EXTERNAL_SERVICES,
} as const;

export default CONFIG;
