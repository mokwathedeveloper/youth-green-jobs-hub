// Admin Components Export Index
// Centralized exports for all admin-specific components

// Layout Components
export { default as AdminLayout } from './AdminLayout';

// Data Display Components
export { default as DataTable } from './DataTable';
export { default as StatusBadge } from './StatusBadge';

// Re-export analytics components for admin use
export { 
  KPICard, 
  ChartCard, 
  AlertCard, 
  SystemHealthCard 
} from '../analytics';

// Types
export type { TableColumn, TableAction } from './DataTable';
export type { StatusType } from './StatusBadge';
