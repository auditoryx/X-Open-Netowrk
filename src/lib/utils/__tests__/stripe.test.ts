import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStripe } from '../stripe';

// Mock loadStripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

describe('getStripe helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  });

  it('throws when key is missing', () => {
    expect(() => getStripe()).toThrow('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  });

  it('returns same promise on repeated calls', async () => {
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test';
    const p1 = getStripe();
    const p2 = getStripe();
    expect(p1).toBe(p2);
    await expect(p1).resolves.toEqual({});
  });
});
