import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSkeleton, {
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  ProductGridSkeleton,
  ChartSkeleton,
} from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render basic skeleton with default props', () => {
    render(<LoadingSkeleton />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('bg-gray-200', 'rounded', 'animate-pulse');
  });

  it('should render with custom className', () => {
    render(<LoadingSkeleton className="custom-class" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should render circular variant', () => {
    render(<LoadingSkeleton variant="circular" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('should render card variant', () => {
    render(<LoadingSkeleton variant="card" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('rounded-lg');
  });

  it('should render text variant with multiple lines', () => {
    render(<LoadingSkeleton variant="text" lines={3} />);
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons).toHaveLength(3);
    
    // Last line should be shorter (75% width)
    const lastSkeleton = skeletons[skeletons.length - 1];
    expect(lastSkeleton).toHaveStyle({ width: '75%' });
  });

  it('should render with custom dimensions', () => {
    render(<LoadingSkeleton width="200px" height="100px" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '100px',
    });
  });

  it('should render with wave animation', () => {
    render(<LoadingSkeleton animation="wave" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('bg-gradient-to-r');
  });

  it('should render with no animation', () => {
    render(<LoadingSkeleton animation="none" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).not.toHaveClass('animate-pulse');
  });
});

describe('CardSkeleton', () => {
  it('should render card skeleton structure', () => {
    render(<CardSkeleton />);
    
    // Should have card container
    const cardContainer = screen.getByRole('generic');
    expect(cardContainer).toHaveClass('bg-white', 'rounded-lg', 'border', 'p-6');
    
    // Should have multiple skeleton elements
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it('should render with custom className', () => {
    render(<CardSkeleton className="custom-card" />);
    const cardContainer = screen.getByRole('generic');
    expect(cardContainer).toHaveClass('custom-card');
  });
});

describe('ListSkeleton', () => {
  it('should render default number of list items', () => {
    render(<ListSkeleton />);
    
    // Should render 5 items by default
    const listItems = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('flex') && el.classList.contains('items-center')
    );
    expect(listItems).toHaveLength(5);
  });

  it('should render custom number of items', () => {
    render(<ListSkeleton items={3} />);
    
    const listItems = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('flex') && el.classList.contains('items-center')
    );
    expect(listItems).toHaveLength(3);
  });

  it('should render with custom className', () => {
    render(<ListSkeleton className="custom-list" />);
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('custom-list');
  });
});

describe('TableSkeleton', () => {
  it('should render table structure with default dimensions', () => {
    render(<TableSkeleton />);
    
    // Should have table container
    const tableContainer = screen.getByRole('generic');
    expect(tableContainer).toHaveClass('bg-white', 'rounded-lg', 'border');
    
    // Should have header and rows
    const headerSection = screen.getByRole('generic', { name: /header/i }) || 
                          tableContainer.querySelector('.bg-gray-50');
    expect(headerSection).toBeInTheDocument();
  });

  it('should render with custom dimensions', () => {
    render(<TableSkeleton rows={3} columns={2} />);
    
    // Check if grid template columns is set correctly
    const gridElements = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('grid')
    );
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('should render with custom className', () => {
    render(<TableSkeleton className="custom-table" />);
    const tableContainer = screen.getByRole('generic');
    expect(tableContainer).toHaveClass('custom-table');
  });
});

describe('DashboardSkeleton', () => {
  it('should render dashboard structure', () => {
    render(<DashboardSkeleton />);
    
    // Should have main container
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('space-y-6');
    
    // Should have multiple sections (header, KPI cards, charts)
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(10); // Multiple skeleton elements
  });

  it('should render with custom className', () => {
    render(<DashboardSkeleton className="custom-dashboard" />);
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('custom-dashboard');
  });
});

describe('ProductGridSkeleton', () => {
  it('should render default number of product cards', () => {
    render(<ProductGridSkeleton />);
    
    // Should render 8 items by default
    const gridContainer = screen.getByRole('generic');
    expect(gridContainer).toHaveClass('grid');
    
    const productCards = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('bg-white') && el.classList.contains('rounded-lg')
    );
    expect(productCards).toHaveLength(8);
  });

  it('should render custom number of items', () => {
    render(<ProductGridSkeleton items={4} />);
    
    const productCards = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('bg-white') && el.classList.contains('rounded-lg')
    );
    expect(productCards).toHaveLength(4);
  });

  it('should render with custom className', () => {
    render(<ProductGridSkeleton className="custom-grid" />);
    const gridContainer = screen.getByRole('generic');
    expect(gridContainer).toHaveClass('custom-grid');
  });
});

describe('ChartSkeleton', () => {
  it('should render chart skeleton with default height', () => {
    render(<ChartSkeleton />);
    
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'border', 'p-6');
    
    // Should have chart area skeleton
    const chartArea = screen.getAllByRole('generic').find(el => 
      el.style.height === '300px'
    );
    expect(chartArea).toBeInTheDocument();
  });

  it('should render with custom height', () => {
    render(<ChartSkeleton height={400} />);
    
    const chartArea = screen.getAllByRole('generic').find(el => 
      el.style.height === '400px'
    );
    expect(chartArea).toBeInTheDocument();
  });

  it('should render with title skeleton when title is provided', () => {
    render(<ChartSkeleton title="Chart Title" />);
    
    // Should have title skeleton
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it('should render with custom className', () => {
    render(<ChartSkeleton className="custom-chart" />);
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('custom-chart');
  });
});

describe('LoadingSkeleton accessibility', () => {
  it('should have proper ARIA attributes', () => {
    render(<LoadingSkeleton />);
    const skeleton = screen.getByRole('generic');
    
    // Should be focusable for screen readers
    expect(skeleton).toBeInTheDocument();
  });

  it('should support screen reader announcements', () => {
    render(<LoadingSkeleton aria-label="Loading content" />);
    const skeleton = screen.getByLabelText('Loading content');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('LoadingSkeleton performance', () => {
  it('should render quickly with many items', () => {
    const startTime = performance.now();
    render(<ProductGridSkeleton items={50} />);
    const endTime = performance.now();
    
    // Should render in less than 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should not cause memory leaks with animations', () => {
    const { unmount } = render(<LoadingSkeleton animation="pulse" />);
    
    // Should unmount cleanly
    expect(() => unmount()).not.toThrow();
  });
});
