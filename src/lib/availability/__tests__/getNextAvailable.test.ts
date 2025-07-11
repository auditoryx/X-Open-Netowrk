import { describe, it, expect, vi } from 'vitest';

// Mock Firebase modules at the top level
vi.mock('@/lib/firebase', () => ({
  app: {}
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn()
}));

// Import the function after mocking
import { getNextAvailable } from '../getNextAvailable';

describe('getNextAvailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when document does not exist', async () => {
    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false
    } as any);

    const result = await getNextAvailable('user-123');
    expect(result).toBeNull();
  });

  it('should return null when no slots are available', async () => {
    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ slots: [] })
    } as any);

    const result = await getNextAvailable('user-123');
    expect(result).toBeNull();
  });

  it('should return null when slots array is missing', async () => {
    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({})
    } as any);

    const result = await getNextAvailable('user-123');
    expect(result).toBeNull();
  });

  it('should return the earliest available slot when multiple slots exist', async () => {
    const slots = [
      { day: 'Friday', time: '10:00 AM' },
      { day: 'Monday', time: '9:00 AM' },
      { day: 'Wednesday', time: '2:00 PM' },
      { day: 'Monday', time: '8:00 AM' }
    ];

    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ slots })
    } as any);

    const result = await getNextAvailable('user-123');
    expect(result).toBe('Mon @ 8:00 AM');
  });

  it('should sort slots by day of week then by time', async () => {
    const slots = [
      { day: 'Sunday', time: '10:00 AM' },
      { day: 'Monday', time: '10:00 AM' },
      { day: 'Tuesday', time: '9:00 AM' },
      { day: 'Wednesday', time: '8:00 AM' },
      { day: 'Thursday', time: '2:00 PM' },
      { day: 'Friday', time: '3:00 PM' },
      { day: 'Saturday', time: '11:00 AM' }
    ];

    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ slots })
    } as any);

    const result = await getNextAvailable('user-123');
    expect(result).toBe('Mon @ 10:00 AM');
  });

  it('should handle single slot correctly', async () => {
    const slots = [
      { day: 'Thursday', time: '3:00 PM' }
    ];

    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ slots })
    } as any);

    const result = await getNextAvailable('user-123');
    expect(result).toBe('Thu @ 3:00 PM');
  });

  it('should sort times within the same day correctly', async () => {
    const slots = [
      { day: 'Monday', time: '11:00 AM' },
      { day: 'Monday', time: '9:00 AM' },
      { day: 'Monday', time: '10:00 AM' }
    ];

    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ slots })
    } as any);

    const result = await getNextAvailable('user-123');
    expect(result).toBe('Mon @ 10:00 AM');
  });

  it('should abbreviate day names correctly', async () => {
    const testCases = [
      { day: 'Monday', expected: 'Mon' },
      { day: 'Tuesday', expected: 'Tue' },
      { day: 'Wednesday', expected: 'Wed' },
      { day: 'Thursday', expected: 'Thu' },
      { day: 'Friday', expected: 'Fri' },
      { day: 'Saturday', expected: 'Sat' },
      { day: 'Sunday', expected: 'Sun' }
    ];

    for (const testCase of testCases) {
      const slots = [{ day: testCase.day, time: '10:00 AM' }];
      
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ slots })
      } as any);

      const result = await getNextAvailable('user-123');
      expect(result).toBe(`${testCase.expected} @ 10:00 AM`);
    }
  });

  it('should handle various time formats correctly', async () => {
    const timeFormats = [
      '9:00 AM',
      '10:30 AM',
      '12:00 PM',
      '2:30 PM',
      '11:45 PM'
    ];

    for (const timeFormat of timeFormats) {
      const slots = [{ day: 'Monday', time: timeFormat }];
      
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ slots })
      } as any);

      const result = await getNextAvailable('user-123');
      expect(result).toBe(`Mon @ ${timeFormat}`);
    }
  });
});