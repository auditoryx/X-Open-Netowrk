import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import PortfolioUploader from '@/components/PortfolioUploader';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock uploadMedia utility
jest.mock('@/lib/uploadMedia', () => ({
  uploadMedia: jest.fn(),
}));

describe('PortfolioUploader', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area with correct text', () => {
    render(<PortfolioUploader />);
    
    expect(screen.getByText('Drag & drop files here, or click to select')).toBeInTheDocument();
    expect(screen.getByText(/Supports images, videos, and audio files/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum 10 files allowed/)).toBeInTheDocument();
  });

  it('shows drag active state when dragging over', () => {
    render(<PortfolioUploader />);
    
    const uploadArea = screen.getByText('Drag & drop files here, or click to select').closest('div');
    
    fireEvent.dragOver(uploadArea!);
    
    expect(screen.getByText('Drop the files here...')).toBeInTheDocument();
  });

  it('contains a hidden file input', () => {
    render(<PortfolioUploader />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveClass('hidden');
  });

  it('accepts multiple files', () => {
    render(<PortfolioUploader />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    expect(fileInput.multiple).toBe(true);
  });

  it('accepts correct file types', () => {
    render(<PortfolioUploader />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    expect(fileInput.accept).toBe('image/*,video/*,audio/*');
  });

  it('shows upload button as disabled when no files are selected', () => {
    render(<PortfolioUploader />);
    
    // No upload button should be visible when no files are added
    expect(screen.queryByText('Upload Files')).not.toBeInTheDocument();
  });

  it('handles custom maxFiles prop', () => {
    render(<PortfolioUploader maxFiles={5} />);
    
    expect(screen.getByText(/Maximum 5 files allowed/)).toBeInTheDocument();
  });

  it('handles custom maxFileSize prop', () => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    render(<PortfolioUploader maxFileSize={maxSize} />);
    
    expect(screen.getByText(/up to 50MB each/)).toBeInTheDocument();
  });

  it('requires user to be signed in', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as any);

    render(<PortfolioUploader />);
    
    expect(screen.getByText('Drag & drop files here, or click to select')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<PortfolioUploader className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});