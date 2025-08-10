import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingForm from '../../components/BookingForm';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('BookingForm Improvements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when submitting', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    render(<BookingForm />);
    
    const nameInput = screen.getByPlaceholderText('YOUR NAME');
    const serviceInput = screen.getByPlaceholderText('SERVICE NAME');
    const submitButton = screen.getByText('BOOK NOW');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(serviceInput, { target: { value: 'Test Service' } });
    
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText('BOOKING...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText('BOOK NOW')).toBeInTheDocument();
    });
  });

  it('uses toast notifications instead of alert', async () => {
    const toast = require('react-hot-toast');
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    render(<BookingForm />);
    
    const nameInput = screen.getByPlaceholderText('YOUR NAME');
    const serviceInput = screen.getByPlaceholderText('SERVICE NAME');
    const submitButton = screen.getByText('BOOK NOW');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(serviceInput, { target: { value: 'Test Service' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Booking created successfully!');
    });
  });

  it('clears form after successful submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    render(<BookingForm />);
    
    const nameInput = screen.getByPlaceholderText('YOUR NAME') as HTMLInputElement;
    const serviceInput = screen.getByPlaceholderText('SERVICE NAME') as HTMLInputElement;
    const submitButton = screen.getByText('BOOK NOW');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(serviceInput, { target: { value: 'Test Service' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(serviceInput.value).toBe('');
    });
  });
});