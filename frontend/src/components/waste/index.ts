// Waste Management Components Export Index
// Centralized exports for all waste collection and management components

// Core Waste Components
export { default as WasteReportForm } from './WasteReportForm';
export { default as WasteReportsList } from './WasteReportsList';
export { default as WasteReportDetail } from './WasteReportDetail';
export { default as WasteDashboard } from './WasteDashboard';

// Collection Components
export { default as CollectionPointsList } from './CollectionPointsList';
export { default as CollectionPointsMap } from './CollectionPointsMap';
export { default as CollectionEventsList } from './CollectionEventsList';
export { default as CollectionEventDetail } from './CollectionEventDetail';

// Credit and Transaction Components
export { default as CreditTransactions } from './CreditTransactions';

// Re-export types for convenience
export type { 
  WasteReport, 
  WasteCategory, 
  CollectionPoint, 
  CollectionEvent, 
  CreditTransaction,
  WasteReportFormData,
  CollectionEventFormData
} from '../../types/waste';
