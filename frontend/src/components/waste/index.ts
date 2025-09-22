// Waste Management Components Export Index
// Centralized exports for all waste collection and management components

// Core Waste Components
export { WasteReportForm } from './WasteReportForm';
export { WasteReportsList } from './WasteReportsList';
export { WasteReportDetail } from './WasteReportDetail';
export { WasteDashboard } from './WasteDashboard';

// Collection Components
export { CollectionPointsList } from './CollectionPointsList';
export { CollectionPointsMap } from './CollectionPointsMap';
export { CollectionEventsList } from './CollectionEventsList';
export { CollectionEventDetail } from './CollectionEventDetail';

// Credit and Transaction Components
export { CreditTransactions } from './CreditTransactions';

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
