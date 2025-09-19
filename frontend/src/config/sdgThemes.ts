/**
 * SDG Theme Configuration for Youth Green Jobs Hub
 * 
 * This module provides the complete SDG theme system with colors,
 * configurations, and utility functions for consistent theming
 * across the application.
 */

import { SDGTheme, SDGThemeConfig, SDGColorPalette } from '../types/sdg';

// SDG Color Palettes based on official SDG colors
const SDG_COLOR_PALETTES: Record<SDGTheme, SDGColorPalette> = {
  // SDG 13: Climate Action (Green)
  'climate-action': {
    primary: '#2E7D32',
    primaryHover: '#388E3C',
    primaryLight: '#C8E6C9',
    primaryDark: '#1B5E20',
    secondary: '#4CAF50',
    accent: '#81C784',
    background: '#F1F8E9',
    text: '#1B5E20',
    textSecondary: '#2E7D32',
    border: '#A5D6A7',
    shadow: 'rgba(46, 125, 50, 0.15)',
  },

  // SDG 11: Sustainable Cities and Communities (Blue)
  'sustainable-cities': {
    primary: '#1976D2',
    primaryHover: '#1E88E5',
    primaryLight: '#BBDEFB',
    primaryDark: '#0D47A1',
    secondary: '#2196F3',
    accent: '#64B5F6',
    background: '#E3F2FD',
    text: '#0D47A1',
    textSecondary: '#1976D2',
    border: '#90CAF9',
    shadow: 'rgba(25, 118, 210, 0.15)',
  },

  // SDG 8: Decent Work and Economic Growth (Orange)
  'decent-work': {
    primary: '#FF9800',
    primaryHover: '#FB8C00',
    primaryLight: '#FFE0B2',
    primaryDark: '#E65100',
    secondary: '#FFA726',
    accent: '#FFCC80',
    background: '#FFF3E0',
    text: '#E65100',
    textSecondary: '#FF9800',
    border: '#FFCC80',
    shadow: 'rgba(255, 152, 0, 0.15)',
  },

  // Default theme (neutral)
  default: {
    primary: '#6B7280',
    primaryHover: '#4B5563',
    primaryLight: '#E5E7EB',
    primaryDark: '#374151',
    secondary: '#9CA3AF',
    accent: '#D1D5DB',
    background: '#F9FAFB',
    text: '#374151',
    textSecondary: '#6B7280',
    border: '#D1D5DB',
    shadow: 'rgba(107, 114, 128, 0.15)',
  },
};

// SDG Theme Configurations
export const SDG_THEMES: Record<SDGTheme, SDGThemeConfig> = {
  'climate-action': {
    name: 'Climate Action',
    goal: 13,
    description: 'Take urgent action to combat climate change and its impacts',
    colors: SDG_COLOR_PALETTES['climate-action'],
    icon: '🌍',
  },
  'sustainable-cities': {
    name: 'Sustainable Cities',
    goal: 11,
    description: 'Make cities and human settlements inclusive, safe, resilient and sustainable',
    colors: SDG_COLOR_PALETTES['sustainable-cities'],
    icon: '🏙️',
  },
  'decent-work': {
    name: 'Decent Work',
    goal: 8,
    description: 'Promote sustained, inclusive and sustainable economic growth, full and productive employment',
    colors: SDG_COLOR_PALETTES['decent-work'],
    icon: '💼',
  },
  default: {
    name: 'Default',
    goal: 0,
    description: 'Default theme for general content',
    colors: SDG_COLOR_PALETTES.default,
    icon: '⚙️',
  },
};

// Utility functions for theme management
export const getSDGTheme = (theme: SDGTheme = 'default'): SDGThemeConfig => {
  return SDG_THEMES[theme] || SDG_THEMES.default;
};

export const getSDGColors = (theme: SDGTheme = 'default'): SDGColorPalette => {
  return getSDGTheme(theme).colors;
};

export const getSDGThemeByGoal = (goal: number): SDGThemeConfig => {
  const themeEntry = Object.entries(SDG_THEMES).find(([_, config]) => config.goal === goal);
  return themeEntry ? themeEntry[1] : SDG_THEMES.default;
};

// CSS custom properties generator for dynamic theming
export const generateSDGCSSVariables = (theme: SDGTheme): Record<string, string> => {
  const colors = getSDGColors(theme);
  return {
    '--sdg-primary': colors.primary,
    '--sdg-primary-hover': colors.primaryHover,
    '--sdg-primary-light': colors.primaryLight,
    '--sdg-primary-dark': colors.primaryDark,
    '--sdg-secondary': colors.secondary,
    '--sdg-accent': colors.accent,
    '--sdg-background': colors.background,
    '--sdg-text': colors.text,
    '--sdg-text-secondary': colors.textSecondary,
    '--sdg-border': colors.border,
    '--sdg-shadow': colors.shadow,
  };
};

// Tailwind class generators for dynamic styling
export const getSDGTailwindClasses = (theme: SDGTheme) => {
  const themeConfig = getSDGTheme(theme);

  return {
    // Background classes
    bg: {
      primary: theme === 'climate-action' ? 'bg-green-600' :
               theme === 'sustainable-cities' ? 'bg-blue-600' :
               theme === 'decent-work' ? 'bg-orange-500' : 'bg-gray-600',
      primaryHover: theme === 'climate-action' ? 'hover:bg-green-700' :
                    theme === 'sustainable-cities' ? 'hover:bg-blue-700' :
                    theme === 'decent-work' ? 'hover:bg-orange-600' : 'hover:bg-gray-700',
      light: theme === 'climate-action' ? 'bg-green-50' :
             theme === 'sustainable-cities' ? 'bg-blue-50' :
             theme === 'decent-work' ? 'bg-orange-50' : 'bg-gray-50',
    },
    // Text classes
    text: {
      primary: theme === 'climate-action' ? 'text-green-600' :
               theme === 'sustainable-cities' ? 'text-blue-600' :
               theme === 'decent-work' ? 'text-orange-500' : 'text-gray-600',
      dark: theme === 'climate-action' ? 'text-green-800' :
            theme === 'sustainable-cities' ? 'text-blue-800' :
            theme === 'decent-work' ? 'text-orange-800' : 'text-gray-800',
    },
    // Border classes
    border: {
      primary: theme === 'climate-action' ? 'border-green-600' :
               theme === 'sustainable-cities' ? 'border-blue-600' :
               theme === 'decent-work' ? 'border-orange-500' : 'border-gray-600',
      light: theme === 'climate-action' ? 'border-green-200' :
             theme === 'sustainable-cities' ? 'border-blue-200' :
             theme === 'decent-work' ? 'border-orange-200' : 'border-gray-200',
    },
    // Ring classes for focus states
    ring: {
      primary: theme === 'climate-action' ? 'ring-green-500' :
               theme === 'sustainable-cities' ? 'ring-blue-500' :
               theme === 'decent-work' ? 'ring-orange-500' : 'ring-gray-500',
    },
  };
};
