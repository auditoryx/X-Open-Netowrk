import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommandPalette, { useCommandPalette } from '@/components/ui/CommandPalette';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassIcon: () => <div>Search Icon</div>,
  XMarkIcon: () => <div>X Icon</div>,
}));

const mockPush = jest.fn();

describe('CommandPalette', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
  });

  it('renders when open', () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} />);
    expect(screen.getByPlaceholderText('Search or type a command...')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CommandPalette isOpen={false} onClose={() => {}} />);
    expect(screen.queryByPlaceholderText('Search or type a command...')).not.toBeInTheDocument();
  });

  it('shows default commands', () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Explore Creators')).toBeInTheDocument();
    expect(screen.getByText('Search Artists')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('filters commands based on search', () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Search or type a command...');
    
    fireEvent.change(input, { target: { value: 'artist' } });
    
    expect(screen.getByText('Search Artists')).toBeInTheDocument();
    expect(screen.queryByText('Search Producers')).not.toBeInTheDocument();
  });

  it('navigates when command is clicked', () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} />);
    
    const exploreButton = screen.getByText('Explore Creators');
    fireEvent.click(exploreButton);
    
    expect(mockPush).toHaveBeenCalledWith('/explore');
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<CommandPalette isOpen={true} onClose={onClose} />);
    
    // Find the backdrop (first div with backdrop styling)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('shows "No results found" when no commands match', () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Search or type a command...');
    
    fireEvent.change(input, { target: { value: 'xyz123nonexistent' } });
    
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});

describe('useCommandPalette hook', () => {
  beforeEach(() => {
    // Mock window.addEventListener
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();
    
    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });
    
    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    });
  });

  it('returns correct initial state', () => {
    const TestComponent = () => {
      const { isOpen, open, close, toggle } = useCommandPalette();
      return (
        <div>
          <div data-testid="isOpen">{isOpen ? 'true' : 'false'}</div>
          <button onClick={open}>Open</button>
          <button onClick={close}>Close</button>
          <button onClick={toggle}>Toggle</button>
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false');
  });
});