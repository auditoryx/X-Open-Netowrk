import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import RevenueSplitViewer from '@/components/booking/RevenueSplitViewer';
import { useContractPdf } from '@/hooks/useContractPdf';
import { Timestamp } from 'firebase/firestore';

// Mock the useContractPdf hook
jest.mock('@/hooks/useContractPdf', () => ({
  useContractPdf: jest.fn()
}));

describe('Revenue Split Contract System', () => {
  const mockBooking = {
    id: 'test-booking-123',
    studioId: 'studio-1',
    clientUids: ['client-1'],
    creatorUid: 'creator-1',
    status: 'confirmed',
    scheduledAt: Timestamp.fromDate(new Date()),
    durationMinutes: 120,
    totalCost: 200,
    sessionTitle: 'Test Session',
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    createdBy: 'client-1',
    revenueSplit: {
      artist: 0.6,
      producer: 0.4
    },
    contractUrl: 'https://example.com/contract.pdf'
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementation
    (useContractPdf as jest.Mock).mockReturnValue({
      contractUrl: mockBooking.contractUrl,
      isLoading: false,
      error: null,
      downloadContract: jest.fn(),
      openContract: jest.fn()
    });
  });

  test('displays revenue split percentages correctly', () => {
    render(<RevenueSplitViewer booking={mockBooking} />);
    
    expect(screen.getByText('Revenue Split Contract')).toBeInTheDocument();
    expect(screen.getByText('artist:')).toBeInTheDocument();
    expect(screen.getByText('producer:')).toBeInTheDocument();
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('40.0%')).toBeInTheDocument();
  });

  test('download button triggers download function', async () => {
    const mockDownload = jest.fn();
    (useContractPdf as jest.Mock).mockReturnValue({
      contractUrl: mockBooking.contractUrl,
      isLoading: false,
      error: null,
      downloadContract: mockDownload,
      openContract: jest.fn()
    });

    render(<RevenueSplitViewer booking={mockBooking} />);
    
    // Find the download button (it has a Download icon)
    const downloadButton = screen.getByTitle('Download contract PDF');
    fireEvent.click(downloadButton);
    
    expect(mockDownload).toHaveBeenCalled();
  });

  test('view button triggers open function', async () => {
    const mockOpen = jest.fn();
    (useContractPdf as jest.Mock).mockReturnValue({
      contractUrl: mockBooking.contractUrl,
      isLoading: false,
      error: null,
      downloadContract: jest.fn(),
      openContract: mockOpen
    });

    render(<RevenueSplitViewer booking={mockBooking} />);
    
    // Find the view button (it has an Eye icon)
    const viewButton = screen.getByTitle('View contract PDF');
    fireEvent.click(viewButton);
    
    expect(mockOpen).toHaveBeenCalled();
  });

  test('shows loading state when isLoading is true', () => {
    (useContractPdf as jest.Mock).mockReturnValue({
      contractUrl: mockBooking.contractUrl,
      isLoading: true,
      error: null,
      downloadContract: jest.fn(),
      openContract: jest.fn()
    });

    render(<RevenueSplitViewer booking={mockBooking} />);
    
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getAllByRole('button')[0]).toBeDisabled();
    expect(screen.getAllByRole('button')[1]).toBeDisabled();
  });

  test('does not render when no revenueSplit or contractUrl is present', () => {
    const bookingWithoutContract = {
      ...mockBooking,
      revenueSplit: undefined,
      contractUrl: undefined
    };
    
    const { container } = render(<RevenueSplitViewer booking={bookingWithoutContract} />);
    
    // The component should render nothing (return null)
    expect(container.firstChild).toBeNull();
  });
});
