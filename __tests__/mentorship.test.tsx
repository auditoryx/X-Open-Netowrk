import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MentorshipBooking, Mentorship } from '@/lib/types/Mentorship';
import MentorshipCard from '@/components/dashboard/MentorshipCard';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { provideMentorshipFeedback } from '@/lib/firestore/mentorshipBookings';

// Mock dependencies
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/lib/firestore/mentorshipBookings', () => ({
  provideMentorshipFeedback: jest.fn(),
  updateMentorshipBookingStatus: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('Mentorship System', () => {
  const mockBooking: MentorshipBooking = {
    id: 'booking-123',
    mentorshipId: 'mentorship-123',
    clientUid: 'client-123',
    creatorUid: 'creator-456',
    title: 'Test Mentorship',
    format: 'async',
    status: 'in_progress',
    price: 50,
    sessionGoal: 'Learn about mixing techniques',
    clientName: 'Test Client',
    creatorName: 'Test Creator',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    paymentStatus: 'paid'
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock auth
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'creator-456' }
    });
  });

  test('Creator can provide feedback for async mentorship', async () => {
    // Arrange
    (provideMentorshipFeedback as jest.Mock).mockResolvedValue(undefined);
    
    // Act - render card with creator viewType
    render(<MentorshipCard booking={mockBooking} viewType="creator" />);
    
    // Click deliver feedback button
    fireEvent.click(screen.getByText('Deliver Feedback'));
    
    // Fill feedback form
    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://example.com/feedback' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Any additional notes about your feedback...'), {
      target: { value: 'Here are some mixing tips' }
    });
    
    // Submit feedback
    fireEvent.click(screen.getByText('Send Feedback'));
    
    // Assert
    await waitFor(() => {
      expect(provideMentorshipFeedback).toHaveBeenCalledWith(
        'booking-123',
        'https://example.com/feedback',
        'Here are some mixing tips'
      );
    });
  });

  test('Client can view feedback when ready', async () => {
    // Arrange
    const feedbackReadyBooking = {
      ...mockBooking,
      status: 'feedback_ready',
      deliverableUrl: 'https://example.com/feedback'
    };
    
    // Act - render card with client viewType
    render(<MentorshipCard booking={feedbackReadyBooking} viewType="client" />);
    
    // Assert
    expect(screen.getByText('Feedback Ready')).toBeInTheDocument();
    expect(screen.getByText('View Feedback')).toBeInTheDocument();
    
    // Click to view feedback
    const viewFeedbackLink = screen.getByText('View Feedback');
    expect(viewFeedbackLink.getAttribute('href')).toBe('https://example.com/feedback');
  });
});
