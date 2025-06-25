// Example cron success path test
import { streakReset } from '../cron/streakReset';

describe('cron streakReset', () => {
  it('runs without throwing', async () => {
    await expect(streakReset()).resolves.not.toThrow();
  });
});
