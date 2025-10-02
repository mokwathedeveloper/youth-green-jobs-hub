/**
 * Toast Component Tests
 * 
 * Comprehensive test suite for the Toast notification component
 * covering rendering, theming, interactions, and auto-dismiss functionality.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '../Toast';
import { NotificationType, SDGTheme } from '../../../types/sdg';

// Mock clsx to avoid issues with dynamic class generation
jest.mock('clsx', () => ({
  clsx: (...args: any[]) => args.filter(Boolean).join(' ')
}));

describe('Toast Component', () => {
  const defaultProps = {
    type: 'info' as NotificationType,
    title: 'Test Notification',
    message: 'This is a test message',
  };

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(<Toast {...defaultProps} />);
      
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
      expect(screen.getByText('This is a test message')).toBeInTheDocument();
    });

    it('renders without message', () => {
      render(<Toast type="info" title="Title Only" />);
      
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByText('This is a test message')).not.toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      render(<Toast {...defaultProps} />);
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Notification Types', () => {
    const types: NotificationType[] = ['success', 'error', 'warning', 'info'];

    types.forEach(type => {
      it(`renders ${type} notification with correct icon`, () => {
        render(<Toast {...defaultProps} type={type} />);
        
        const toast = screen.getByRole('alert');
        expect(toast).toBeInTheDocument();
        
        // Check for icon presence (icons are rendered as SVG elements)
        const icon = toast.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('SDG Theming', () => {
    const themes: SDGTheme[] = ['climate-action', 'sustainable-cities', 'decent-work', 'default'];

    themes.forEach(theme => {
      it(`renders with ${theme} theme`, () => {
        render(<Toast {...defaultProps} theme={theme} />);
        
        expect(screen.getByText('Test Notification')).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Features', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onClose = jest.fn();
      
      render(<Toast {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('Close notification');
      await user.click(closeButton);
      
      // Wait for animation to complete
      jest.advanceTimersByTime(300);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders action buttons', () => {
      const actions = (
        <button data-testid="action-button">Action</button>
      );
      
      render(<Toast {...defaultProps} actions={actions} />);
      
      expect(screen.getByTestId('action-button')).toBeInTheDocument();
    });
  });

  describe('Auto-dismiss Functionality', () => {
    it('auto-dismisses after specified duration', async () => {
      const onClose = jest.fn();
      const duration = 3000;
      
      render(<Toast {...defaultProps} duration={duration} onClose={onClose} />);
      
      // Fast-forward time
      jest.advanceTimersByTime(duration);
      
      // Wait for animation
      jest.advanceTimersByTime(300);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not auto-dismiss when duration is 0', () => {
      const onClose = jest.fn();
      
      render(<Toast {...defaultProps} duration={0} onClose={onClose} />);
      
      // Fast-forward a long time
      jest.advanceTimersByTime(10000);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('shows progress bar for auto-dismiss', () => {
      const { container } = render(<Toast {...defaultProps} duration={3000} />);
      
      const progressBar = container.querySelector('.h-1');
      expect(progressBar).toBeInTheDocument();
    });

    it('does not show progress bar when duration is 0', () => {
      const { container } = render(<Toast {...defaultProps} duration={0} />);
      
      const progressBar = container.querySelector('.h-1');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('starts with visible state', () => {
      const { container } = render(<Toast {...defaultProps} />);
      
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass('translate-x-0', 'opacity-100', 'scale-100');
    });

    it('applies exit animation when closing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<Toast {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close notification');
      await user.click(closeButton);
      
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass('translate-x-full', 'opacity-0', 'scale-95');
    });
  });

  describe('Accessibility', () => {
    it('has proper close button accessibility', () => {
      render(<Toast {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close notification');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    });

    it('has proper icon accessibility', () => {
      render(<Toast {...defaultProps} />);
      
      const icon = screen.getByRole('alert').querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const longTitle = 'This is a very long notification title that should be handled gracefully';
      
      render(<Toast {...defaultProps} title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles very long messages', () => {
      const longMessage = 'This is a very long notification message that should wrap properly and not break the layout of the toast notification component';
      
      render(<Toast {...defaultProps} message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles undefined theme gracefully', () => {
      render(<Toast {...defaultProps} theme={undefined} />);
      
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });

    it('cleans up timer on unmount', () => {
      const onClose = jest.fn();
      const { unmount } = render(<Toast {...defaultProps} duration={3000} onClose={onClose} />);
      
      unmount();
      
      // Fast-forward time after unmount
      jest.advanceTimersByTime(5000);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
