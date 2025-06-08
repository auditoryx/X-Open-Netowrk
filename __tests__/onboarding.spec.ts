import { onboardingByRole } from '@/constants/onboardingByRole';

test.each(Object.keys(onboardingByRole))('%s has >=5 steps', (role) => {
  expect(onboardingByRole[role as keyof typeof onboardingByRole].length).toBeGreaterThanOrEqual(5);
});
