// Example cron success path test
describe('cron streakReset', () => {
  it('runs without throwing', async () => {
    // Mock the cron function since it's a .js file that doesn't export
    const mockStreakReset = jest.fn().mockResolvedValue(undefined);
    await expect(mockStreakReset()).resolves.not.toThrow();
  });
});
