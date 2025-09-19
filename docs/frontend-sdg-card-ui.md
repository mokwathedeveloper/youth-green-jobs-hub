# Frontend SDG Card UI System

## Overview

This document describes the comprehensive SDG (Sustainable Development Goals) themed UI system implemented for the Youth Green Jobs & Waste Recycling Hub project. The system provides reusable components with consistent SDG theming, comprehensive testing, and professional documentation.

## Architecture

### Core Components

#### 1. SDG Theme System (`src/config/sdgThemes.ts`)
- **Purpose**: Centralized SDG theme configuration with official colors
- **Features**:
  - Climate Action (Green #2E7D32)
  - Sustainable Cities (Blue #1976D2) 
  - Decent Work (Orange #FF9800)
  - Utility functions for theme management
  - Tailwind CSS class generation

#### 2. SDGCard Component (`src/components/ui/SDGCard.tsx`)
- **Purpose**: Reusable card component with dynamic SDG theming
- **Features**:
  - Multiple variants: solid, outline, ghost, gradient
  - Multiple sizes: sm, md, lg, xl
  - Interactive features with hover effects
  - Accessibility compliance with ARIA attributes
  - Mobile-first responsive design

#### 3. Toast Notification System
- **Components**: 
  - `Toast.tsx` - Individual toast component
  - `ToastContainer.tsx` - Portal-based container
  - `ToastContext.tsx` - Global state management
- **Features**:
  - Auto-dismiss with progress bar
  - SDG theming support
  - Multiple notification types
  - Portal-based rendering

#### 4. Enhanced Layout Components
- **Navbar** (`src/components/layout/Navbar.tsx`):
  - SDG theming integration
  - Responsive navigation
  - Authentication-aware UI
  - User dropdown menu
- **Footer** (`src/components/layout/Footer.tsx`):
  - SDG goals showcase
  - Social links and newsletter signup
  - Contact information

#### 5. ContactForm Component (`src/components/ui/ContactForm.tsx`)
- **Purpose**: Professional contact form with validation
- **Features**:
  - React Hook Form integration
  - Zod schema validation
  - Category-based inquiry system
  - Priority levels
  - SDG theming

## TypeScript Definitions

### SDG Types (`src/types/sdg.ts`)
```typescript
export type SDGTheme = 'climate-action' | 'sustainable-cities' | 'decent-work';

export interface SDGColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface SDGCardProps {
  theme: SDGTheme;
  variant?: 'solid' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  badge?: string;
  interactive?: boolean;
}
```

## Testing Infrastructure

### Jest Configuration (`jest.config.js`)
- TypeScript support with ts-jest
- React Testing Library integration
- 80% coverage threshold requirement
- Module path mapping for clean imports

### Test Coverage Requirements
- **Minimum**: 80% overall coverage
- **Components**: Individual component tests
- **Integration**: Context and hook testing
- **Accessibility**: ARIA compliance testing

### Test Files Structure
```
src/components/ui/__tests__/
├── SDGCard.test.tsx
├── Toast.test.tsx
└── ContactForm.test.tsx (planned)
```

## Usage Examples

### Basic SDGCard Usage
```tsx
import { SDGCard } from '@/components/ui/SDGCard';

<SDGCard
  theme="climate-action"
  variant="solid"
  size="md"
  title="Green Jobs Initiative"
  description="Connect with sustainable employment opportunities"
  interactive
  onClick={() => navigate('/jobs')}
/>
```

### Toast Notifications
```tsx
import { useToast } from '@/contexts/ToastContext';

const { showToast } = useToast();

showToast({
  message: 'Profile updated successfully!',
  type: 'success',
  theme: 'climate-action'
});
```

### ContactForm Integration
```tsx
import { ContactForm } from '@/components/ui/ContactForm';

<ContactForm
  theme="sustainable-cities"
  onSubmit={handleContactSubmit}
  className="max-w-2xl mx-auto"
/>
```

## Development Workflow

### Git Workflow
1. Individual file commits with descriptive messages
2. Professional commit structure following conventional commits
3. Branch naming: `frontend-sdg-card-ui`
4. PR template with testing results and coverage reports

### Testing Workflow
```bash
# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test SDGCard.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build

# Type checking
npm run type-check
```

## Technical Specifications

### Dependencies
- **React**: 19.1.1
- **TypeScript**: Latest
- **Tailwind CSS**: 4.1.13
- **React Hook Form**: Latest
- **Zod**: Latest
- **Jest**: Latest
- **React Testing Library**: Latest

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Accessibility compliance (WCAG 2.1)

### Performance Considerations
- Lazy loading for large components
- Optimized bundle size
- Tree shaking support
- CSS-in-JS optimization

## Future Enhancements

### Planned Features
1. **Additional SDG Themes**: Expand to cover all 17 SDG goals
2. **Animation System**: Smooth transitions and micro-interactions
3. **Dark Mode Support**: Theme-aware dark mode implementation
4. **Internationalization**: Multi-language support
5. **Advanced Analytics**: Component usage tracking

### Component Roadmap
1. **SDGModal**: Modal dialogs with SDG theming
2. **SDGTable**: Data tables with theme integration
3. **SDGChart**: Chart components for analytics
4. **SDGForm**: Enhanced form components

## Troubleshooting

### Common Issues
1. **TypeScript Errors**: Ensure esModuleInterop is enabled in tsconfig.json
2. **Test Failures**: Check Jest configuration and module mappings
3. **Theme Issues**: Verify SDG theme names match defined types
4. **Import Errors**: Use absolute imports with @ prefix

### Performance Issues
1. **Bundle Size**: Use dynamic imports for large components
2. **Render Performance**: Implement React.memo for expensive components
3. **Memory Leaks**: Properly cleanup event listeners and timers

## Contributing

### Code Standards
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new components
- Document all public APIs
- Follow accessibility guidelines

### Review Process
1. Self-review checklist completion
2. Automated testing validation
3. Code review by team members
4. Manual testing verification
5. Documentation updates

---

**Last Updated**: 2025-09-19  
**Version**: 1.0.0  
**Maintainer**: Augment AI Development Team
