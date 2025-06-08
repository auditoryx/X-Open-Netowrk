import { sendBookingConfirmation } from '../sendBookingConfirmation';
import { sendEmail } from '../sendEmail';

jest.mock('../sendEmail', () => ({ sendEmail: jest.fn() }));
const mockedSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

beforeEach(() => {
  jest.clearAllMocks();
});

test('calls sendEmail with formatted subject', async () => {
  mockedSendEmail.mockResolvedValue({ success: true });
  const res = await sendBookingConfirmation('to@test.com', 'Jan 1', 'msg', 'Joe');
  expect(mockedSendEmail).toHaveBeenCalledWith(
    'to@test.com',
    '📅 New Booking Request – Jan 1',
    'booking-confirmation.html',
    { selectedTime: 'Jan 1', message: 'msg', senderName: 'Joe', providerTZ: '', clientTZ: '' }
  );
  expect(res).toEqual({ success: true });
});

test('returns error when sendEmail fails', async () => {
  mockedSendEmail.mockResolvedValue({ error: 'e' } as any);
  const res = await sendBookingConfirmation('to@test.com', 'Jan 1', 'msg');
  expect(res).toEqual({ error: 'e' });
});
