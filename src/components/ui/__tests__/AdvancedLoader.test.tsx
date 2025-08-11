import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedLoader from '@/components/ui/AdvancedLoader';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the useAnimatedText hook
jest.mock('@/hooks/useLoadingState', () => ({
  useAnimatedText: (text: string) => ({
    animatedText: text,
    isComplete: true,
  }),
}));

describe('AdvancedLoader', () => {
  it('should render loading text', () => {
    render(<AdvancedLoader text="Loading test..." />);
    expect(screen.getByText(/Loading test/)).toBeInTheDocument();
  });

  it('should not render when not loading', () => {
    const { container } = render(<AdvancedLoader isLoading={false} text="Loading test..." />);
    expect(container.firstChild).toBeNull();
  });

  it('should render progress when showProgress is true', () => {
    render(<AdvancedLoader showProgress={true} progress={50} text="Loading..." />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should render different variants', () => {
    const { rerender } = render(<AdvancedLoader variant="dots" />);
    expect(document.querySelector('.animate-loading-dots')).toBeInTheDocument();

    rerender(<AdvancedLoader variant="minimal" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});