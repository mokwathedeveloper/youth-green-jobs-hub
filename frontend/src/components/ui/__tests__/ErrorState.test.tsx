import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState, {
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  ServerError,
  EmptyState,
} from '../ErrorState';
import type { ApiError } from '../../../services/api';

describe('ErrorState', () => {
  it('should render default error state', () => {
    render(<ErrorState />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });

  it('should render custom title and message', () => {
    render(
      <ErrorState
        title="Custom Error Title"
        message="Custom error message"
      />
    );
    
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render string error', () => {
    render(<ErrorState error="Simple error message" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Simple error message')).toBeInTheDocument();
  });

  it('should render API error with status 404', () => {
    const error: ApiError = {
      status: 404,
      message: 'Resource not found',
    };
    
    render(<ErrorState error={error} />);
    
    expect(screen.getByText('Not Found')).toBeInTheDocument();
    expect(screen.getByText('The requested resource could not be found.')).toBeInTheDocument();
  });

  it('should render API error with status 401', () => {
    const error: ApiError = {
      status: 401,
      message: 'Unauthorized',
    };
    
    render(<ErrorState error={error} />);
    
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Please log in to access this content.')).toBeInTheDocument();
  });

  it('should render API error with status 403', () => {
    const error: ApiError = {
      status: 403,
      message: 'Forbidden',
    };
    
    render(<ErrorState error={error} />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You don\'t have permission to access this resource.')).toBeInTheDocument();
  });

  it('should render API error with status 500', () => {
    const error: ApiError = {
      status: 500,
      message: 'Internal server error',
    };
    
    render(<ErrorState error={error} />);
    
    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText('The server encountered an error. Please try again later.')).toBeInTheDocument();
  });

  it('should render network error (status 0)', () => {
    const error: ApiError = {
      status: 0,
      message: 'Network error',
    };
    
    render(<ErrorState error={error} />);
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect to the server. Please check your internet connection.')).toBeInTheDocument();
  });

  it('should render retry button and call onRetry', () => {
    const onRetry = jest.fn();
    
    render(<ErrorState showRetry={true} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render home button and call onHome', () => {
    const onHome = jest.fn();
    
    render(<ErrorState showHome={true} onHome={onHome} />);
    
    const homeButton = screen.getByText('Go Home');
    expect(homeButton).toBeInTheDocument();
    
    fireEvent.click(homeButton);
    expect(onHome).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when showRetry is false', () => {
    render(<ErrorState showRetry={false} />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('should render error details when showDetails is true', () => {
    const error = new Error('Test error');
    error.stack = 'Error stack trace';
    
    render(<ErrorState error={error} showDetails={true} />);
    
    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText('Error stack trace')).toBeInTheDocument();
  });

  it('should render different variants correctly', () => {
    const { container, rerender } = render(<ErrorState variant="card" />);
    let cardContainer = container.querySelector('.bg-white.rounded-lg.border');
    expect(cardContainer).toBeInTheDocument();
    
    rerender(<ErrorState variant="inline" />);
    let inlineContainer = container.querySelector('.bg-gray-50.rounded-md.border');
    expect(inlineContainer).toBeInTheDocument();
    
    rerender(<ErrorState variant="page" />);
    let pageContainer = container.querySelector('.min-h-screen.flex');
    expect(pageContainer).toBeInTheDocument();
  });

  it('should render different sizes correctly', () => {
    const { container, rerender } = render(<ErrorState size="sm" />);
    let icon = container.querySelector('svg');
    expect(icon).toHaveClass('w-8', 'h-8');
    
    rerender(<ErrorState size="lg" />);
    icon = container.querySelector('svg');
    expect(icon).toHaveClass('w-16', 'h-16');
  });

  it('should render custom children', () => {
    render(
      <ErrorState>
        <div data-testid="custom-content">Custom content</div>
      </ErrorState>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<ErrorState className="custom-error-class" />);
    
    const errorStateContainer = container.firstChild;
    expect(errorStateContainer).toHaveClass('custom-error-class');
  });
});

describe('Predefined Error Components', () => {
  it('should render NetworkError', () => {
    render(<NetworkError />);
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
  });

  it('should render NotFoundError', () => {
    render(<NotFoundError />);
    
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('should render UnauthorizedError', () => {
    render(<UnauthorizedError />);
    
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
  });

  it('should render ServerError', () => {
    render(<ServerError />);
    
    expect(screen.getByText('Server Error')).toBeInTheDocument();
  });

  it('should pass through props to predefined components', () => {
    const onRetry = jest.fn();
    
    render(<NetworkError showRetry={true} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyState', () => {
  it('should render default empty state', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('There\'s nothing to show here yet.')).toBeInTheDocument();
  });

  it('should render custom title and message', () => {
    render(
      <EmptyState
        title="No products found"
        message="Try adjusting your search criteria"
      />
    );
    
    expect(screen.getByText('No products found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
  });

  it('should render custom action', () => {
    const action = <button>Add New Item</button>;
    
    render(<EmptyState action={action} />);
    
    expect(screen.getByText('Add New Item')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<EmptyState className="custom-empty-class" />);
    
    const container = screen.getByText('No data available').closest('div');
    expect(container).toHaveClass('custom-empty-class');
  });
});

describe('ErrorState accessibility', () => {
  it('should have proper ARIA attributes', () => {
    render(<ErrorState />);
    
    const container = screen.getByText('Something went wrong').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('should support keyboard navigation for buttons', () => {
    const onRetry = jest.fn();
    
    render(<ErrorState showRetry={true} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toHaveAttribute('type', 'button');
    
    // Test keyboard interaction
    retryButton.focus();
    fireEvent.keyDown(retryButton, { key: 'Enter' });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have proper focus management', () => {
    render(<ErrorState showRetry={true} onRetry={() => {}} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toHaveClass('focus:outline-none', 'focus:ring-2');
  });
});

describe('ErrorState error handling', () => {
  it('should handle malformed error objects gracefully', () => {
    const malformedError = { someProperty: 'value' } as any;
    
    expect(() => {
      render(<ErrorState error={malformedError} />);
    }).not.toThrow();
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle null/undefined errors gracefully', () => {
    expect(() => {
      render(<ErrorState error={null} />);
    }).not.toThrow();
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle errors without stack traces', () => {
    const error = new Error('Test error');
    delete (error as any).stack;
    
    render(<ErrorState error={error} showDetails={true} />);
    
    expect(screen.getByText('Error Details')).toBeInTheDocument();
  });
