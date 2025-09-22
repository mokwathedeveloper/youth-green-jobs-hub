// UI Components Export Index
// Centralized exports for all reusable UI components

// shadcn/ui Base Components
export { Button } from './button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

// Custom UI Components
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Modal } from './Modal';
export { default as Alert } from './Alert';
export { default as Toast } from './Toast';
export { default as ToastContainer } from './ToastContainer';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as EmptyState } from './EmptyState';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as LazyImage } from './LazyImage';
export { default as VirtualizedList } from './VirtualizedList';
export { default as ContactForm } from './ContactForm';

// SDG-themed Components
export { default as SDGCard } from './SDGCard';

// Re-export types for convenience
export type { SDGCardProps, SDGTheme } from '../../types/sdg';
