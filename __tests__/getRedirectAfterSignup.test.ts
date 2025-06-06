import { getRedirectAfterSignup } from '@/app/signup/getRedirectAfterSignup';

describe('getRedirectAfterSignup', () => {
  test('redirects to /apply when role is missing', () => {
    expect(getRedirectAfterSignup(null, '/dashboard')).toBe('/apply');
  });

  test('redirects to provided path when role exists', () => {
    expect(getRedirectAfterSignup('artist', '/dashboard')).toBe('/dashboard');
  });
});
