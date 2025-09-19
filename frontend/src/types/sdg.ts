/**
 * SDG (Sustainable Development Goals) Theme System Types
 * 
 * This module defines TypeScript types for the SDG-themed UI system
 * used throughout the Youth Green Jobs Hub platform.
 */

// SDG Theme identifiers mapped to specific goals
export type SDGTheme = 'climate-action' | 'sustainable-cities' | 'decent-work' | 'default';

// SDG Goal mapping for semantic naming
export const SDG_GOALS = {
  'climate-action': 13, // Climate Action
  'sustainable-cities': 11,  // Sustainable Cities and Communities
  'decent-work': 8,     // Decent Work and Economic Growth
} as const;

// Color palette for each SDG theme
export interface SDGColorPalette {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

// SDG theme configuration
export interface SDGThemeConfig {
  name: string;
  goal: number;
  description: string;
  colors: SDGColorPalette;
  icon?: string;
}

// Component size variants
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

// Component variant types
export type ComponentVariant = 'solid' | 'outline' | 'ghost' | 'gradient';

// Card component specific props
export interface SDGCardProps {
  title: string;
  description?: string;
  theme?: SDGTheme;
  size?: ComponentSize;
  variant?: ComponentVariant;
  icon?: React.ReactNode;
  image?: string;
  badge?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  interactive?: boolean;
}

// Notification/Alert types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  theme?: SDGTheme;
  duration?: number;
  onClose?: () => void;
  actions?: React.ReactNode;
}

// Layout component props
export interface LayoutComponentProps {
  theme?: SDGTheme;
  className?: string;
  children?: React.ReactNode;
}

// Form component props with SDG theming
export interface SDGFormProps {
  theme?: SDGTheme;
  onSubmit: (data: any) => void;
  loading?: boolean;
  className?: string;
}

// Navigation item with SDG theming
export interface SDGNavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  theme?: SDGTheme;
  badge?: string | number;
  children?: SDGNavItem[];
}
