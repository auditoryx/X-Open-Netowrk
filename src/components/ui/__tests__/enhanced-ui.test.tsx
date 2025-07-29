import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '@/components/ui/Button';
import EmptyState, { NoResultsEmpty } from '@/components/ui/EmptyState';

// Mock framer-motion to avoid issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Enhanced UI Components', () => {
  describe('Button', () => {
    it('renders with correct variant classes', () => {
      render(<Button variant="primary">Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-brutalist');
    });

    it('renders secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-brutalist-secondary');
    });

    it('can disable animations', () => {
      render(<Button animate={false}>No Animation</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('EmptyState', () => {
    it('renders empty state with title and description', () => {
      render(
        <EmptyState
          title="No Results"
          description="Try adjusting your search"
        />
      );
      
      expect(screen.getByText('No Results')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      render(
        <EmptyState
          title="No Results"
          description="Try adjusting your search"
          actionText="Clear Filters"
          actionHref="/explore"
        />
      );
      
      const actionButton = screen.getByText('Clear Filters');
      expect(actionButton).toBeInTheDocument();
      expect(actionButton.closest('a')).toHaveAttribute('href', '/explore');
    });
  });

  describe('NoResultsEmpty', () => {
    it('renders with search query', () => {
      render(<NoResultsEmpty searchQuery="test query" />);
      expect(screen.getByText(/No creators match "test query"/)).toBeInTheDocument();
    });

    it('renders without search query', () => {
      render(<NoResultsEmpty />);
      expect(screen.getByText(/No creators match your current filters/)).toBeInTheDocument();
    });
  });
});