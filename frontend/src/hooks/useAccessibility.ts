import { useEffect, useCallback, useRef, useState } from 'react';

interface UseAccessibilityOptions {
  announceChanges?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const { announceChanges = false, trapFocus = false, restoreFocus = false } = options;
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Announce changes to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [announceChanges]);

  // Focus management
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    if (lastElement) {
      lastElement.focus();
    }
  }, []);

  // Trap focus within container
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return;

    if (event.key === 'Tab') {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Escape key handling
    if (event.key === 'Escape') {
      const escapeEvent = new CustomEvent('escape-pressed');
      containerRef.current.dispatchEvent(escapeEvent);
    }
  }, [trapFocus]);

  // Set up focus trap
  useEffect(() => {
    if (trapFocus) {
      // Store previously focused element
      if (restoreFocus) {
        previouslyFocusedElement.current = document.activeElement as HTMLElement;
      }

      // Add event listener
      document.addEventListener('keydown', handleKeyDown);

      // Focus first element
      setTimeout(focusFirst, 0);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);

        // Restore focus
        if (restoreFocus && previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [trapFocus, restoreFocus, handleKeyDown, focusFirst]);

  return {
    containerRef,
    announce,
    focusFirst,
    focusLast,
  };
};

// Hook for managing ARIA attributes
export const useAriaAttributes = () => {
  const [ariaAttributes, setAriaAttributes] = useState<Record<string, string>>({});

  const setAriaLabel = useCallback((label: string) => {
    setAriaAttributes(prev => ({ ...prev, 'aria-label': label }));
  }, []);

  const setAriaDescribedBy = useCallback((id: string) => {
    setAriaAttributes(prev => ({ ...prev, 'aria-describedby': id }));
  }, []);

  const setAriaExpanded = useCallback((expanded: boolean) => {
    setAriaAttributes(prev => ({ ...prev, 'aria-expanded': expanded.toString() }));
  }, []);

  const setAriaSelected = useCallback((selected: boolean) => {
    setAriaAttributes(prev => ({ ...prev, 'aria-selected': selected.toString() }));
  }, []);

  const setAriaChecked = useCallback((checked: boolean | 'mixed') => {
    setAriaAttributes(prev => ({ ...prev, 'aria-checked': checked.toString() }));
  }, []);

  const setAriaDisabled = useCallback((disabled: boolean) => {
    setAriaAttributes(prev => ({ ...prev, 'aria-disabled': disabled.toString() }));
  }, []);

  const setAriaHidden = useCallback((hidden: boolean) => {
    setAriaAttributes(prev => ({ ...prev, 'aria-hidden': hidden.toString() }));
  }, []);

  const setAriaLive = useCallback((live: 'off' | 'polite' | 'assertive') => {
    setAriaAttributes(prev => ({ ...prev, 'aria-live': live }));
  }, []);

  const setCustomAria = useCallback((key: string, value: string) => {
    setAriaAttributes(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAriaAttribute = useCallback((key: string) => {
    setAriaAttributes(prev => {
      const newAttributes = { ...prev };
      delete newAttributes[key];
      return newAttributes;
    });
  }, []);

  return {
    ariaAttributes,
    setAriaLabel,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaSelected,
    setAriaChecked,
    setAriaDisabled,
    setAriaHidden,
    setAriaLive,
    setCustomAria,
    clearAriaAttribute,
  };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  items: any[],
  onSelect?: (item: any, index: number) => void
) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && onSelect) {
          onSelect(items[activeIndex], activeIndex);
        }
        break;
      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  }, [items, activeIndex, onSelect]);

  const resetNavigation = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    resetNavigation,
  };
};

// Hook for responsive design utilities
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setScreenSize('sm');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 768) {
        setScreenSize('md');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width < 1024) {
        setScreenSize('lg');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width < 1280) {
        setScreenSize('xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else {
        setScreenSize('2xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
  };
};
