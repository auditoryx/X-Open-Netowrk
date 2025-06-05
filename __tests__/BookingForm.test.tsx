import { render, screen } from '@testing-library/react';
import BookingForm from '@/components/booking/BookingForm';

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: '1' } })
}));

jest.mock('@/lib/hooks/useProviderAvailability', () => ({
  useProviderAvailability: () => ({ slots: [], busySlots: [], timezone: 'UTC' })
}));

test('renders booking form with submit button', () => {
  render(<BookingForm providerId="123" onBooked={() => {}} />);
  expect(screen.getByRole('button', { name: /send booking request/i })).toBeInTheDocument();
});
