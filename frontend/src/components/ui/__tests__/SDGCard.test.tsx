/**
 * SDG Card Component Tests
 * 
 * Comprehensive test suite for the SDGCard component covering
 * rendering, props handling, theming, interactions, and accessibility.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Heart } from 'lucide-react';
import SDGCard from '../SDGCard';
import { SDGTheme } from '../../../types/sdg';

// Mock clsx to avoid issues with dynamic class generation
jest.mock('clsx', () => ({
  clsx: (...args: any[]) => args.filter(Boolean).join(' ')
}));

describe('SDGCard Component', () => {
  const defaultProps = {
    title: 'Test Card Title',
    description: 'Test card description',
  };

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(<SDGCard {...defaultProps} />);
      
      expect(screen.getByText('Test Card Title')).toBeInTheDocument();
      expect(screen.getByText('Test card description')).toBeInTheDocument();
    });

    it('renders without description', () => {
      render(<SDGCard title="Title Only" />);
      
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByText('Test card description')).not.toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <SDGCard {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders children content', () => {
      render(
        <SDGCard {...defaultProps}>
          <div data-testid="child-content">Child Content</div>
        </SDGCard>
      );
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('SDG Theming', () => {
    const themes: SDGTheme[] = ['climate-action', 'sustainable-cities', 'decent-work', 'default'];

    themes.forEach(theme => {
      it(`renders with ${theme} theme`, () => {
        render(<SDGCard {...defaultProps} theme={theme} />);
        
        const card = screen.getByText('Test Card Title').closest('div');
        expect(card).toBeInTheDocument();
        
        // Check for SDG badge (except default theme)
        if (theme !== 'default') {
          const expectedGoal = theme === 'climate-action' ? 13 : theme === 'sustainable-cities' ? 11 : 8;
          expect(screen.getByText(`SDG ${expectedGoal}`)).toBeInTheDocument();
        }
      });
    });

    it('defaults to default theme when no theme provided', () => {
      render(<SDGCard {...defaultProps} />);
      
      // Should not show SDG badge for default theme
      expect(screen.queryByText(/SDG \d+/)).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    sizes.forEach(size => {
      it(`renders with ${size} size`, () => {
        const { container } = render(
          <SDGCard {...defaultProps} size={size} />
        );
        
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('Visual Variants', () => {
    const variants = ['solid', 'outline', 'ghost', 'gradient'] as const;

    variants.forEach(variant => {
      it(`renders with ${variant} variant`, () => {
        const { container } = render(
          <SDGCard {...defaultProps} variant={variant} />
        );
        
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Features', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<SDGCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation (Enter)', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<SDGCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation (Space)', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<SDGCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not handle clicks when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<SDGCard {...defaultProps} onClick={handleClick} disabled />);
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(handleClick).not.toHaveBeenCalled();
      expect(card).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not handle clicks when loading', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<SDGCard {...defaultProps} onClick={handleClick} loading />);
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<SDGCard {...defaultProps} loading />);
      
      // Check for loading spinner (Loader2 icon)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows loading overlay', () => {
      const { container } = render(<SDGCard {...defaultProps} loading />);
      
      const overlay = container.querySelector('.absolute.inset-0');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Icon and Image Support', () => {
    it('renders with icon', () => {
      render(
        <SDGCard {...defaultProps} icon={<Heart data-testid="heart-icon" />} />
      );
      
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('renders with image', () => {
      const imageUrl = 'https://example.com/image.jpg';
      render(<SDGCard {...defaultProps} image={imageUrl} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', imageUrl);
      expect(image).toHaveAttribute('alt', 'Test Card Title');
    });
  });

  describe('Actions Support', () => {
    it('renders action buttons', () => {
      const actions = (
        <button data-testid="action-button">Action</button>
      );
      
      render(<SDGCard {...defaultProps} actions={actions} />);
      
      expect(screen.getByTestId('action-button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes when clickable', () => {
      const handleClick = jest.fn();
      render(<SDGCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('does not have button role when not clickable', () => {
      render(<SDGCard {...defaultProps} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('has proper disabled state', () => {
      const handleClick = jest.fn();
      render(<SDGCard {...defaultProps} onClick={handleClick} disabled />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const longTitle = 'This is a very long title that should be truncated properly when it exceeds the available space';
      
      render(<SDGCard title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles empty actions', () => {
      render(<SDGCard {...defaultProps} actions={null} />);
      
      expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    });

    it('handles undefined theme gracefully', () => {
      render(<SDGCard {...defaultProps} theme={undefined} />);
      
      expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    });
  });
});
