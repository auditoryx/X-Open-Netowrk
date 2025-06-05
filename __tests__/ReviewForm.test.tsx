import { render, screen } from '@testing-library/react';
import ReviewForm from '@/components/booking/ReviewForm';

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: '1' } })
}));

jest.mock('@/lib/firestore/reviews/submitReview', () => ({
  submitReview: jest.fn(() => Promise.resolve())
}));

jest.mock('@/lib/notifications/sendInAppNotification', () => ({
  sendInAppNotification: jest.fn(() => Promise.resolve())
}));

test('renders review form with submit button', () => {
  render(<ReviewForm bookingId="1" providerId="2" contractId="3" />);
  expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
});
