import { sendDisputeEmail } from '../sendDisputeEmail';
import { sendEmail } from '../sendEmail';

jest.mock('../sendEmail', () => ({ sendEmail: jest.fn() }));
const mockedSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

beforeEach(() => {
  jest.clearAllMocks();
});

test('calls sendEmail with admin address', async () => {
  mockedSendEmail.mockResolvedValue({ success: true });
  const res = await sendDisputeEmail('b1', 'u1', 'bad');
  expect(mockedSendEmail).toHaveBeenCalledWith(
    'admin@auditoryx.com',
    '🛑 New Dispute Submitted – Booking b1',
    'dispute-notification.html',
    { bookingId: 'b1', fromUser: 'u1', reason: 'bad' }
  );
  expect(res).toEqual({ success: true });
});

test('returns error when sendEmail fails', async () => {
  mockedSendEmail.mockResolvedValue({ error: 'e' } as any);
  const res = await sendDisputeEmail('b1', 'u1', 'bad');
  expect(res).toEqual({ error: 'e' });
});
