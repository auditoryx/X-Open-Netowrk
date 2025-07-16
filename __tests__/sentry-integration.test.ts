describe('Sentry Integration', () => {
  it('should export sendTestEvent function', () => {
    const { sendTestEvent } = require('../scripts/sentry-ping.js');
    expect(typeof sendTestEvent).toBe('function');
  });

  it('should throw error when SENTRY_DSN is not set', async () => {
    // Ensure no env var is set
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    const { sendTestEvent } = require('../scripts/sentry-ping.js');
    await expect(sendTestEvent()).rejects.toThrow('SENTRY_DSN not found in environment variables');
  });

  it('should be able to call sendTestEvent with DSN', async () => {
    // Set environment variable
    process.env.SENTRY_DSN = 'https://mock@mock.ingest.sentry.io/mock';

    const { sendTestEvent } = require('../scripts/sentry-ping.js');
    const result = await sendTestEvent();

    expect(result).toHaveProperty('messageId');
    expect(result).toHaveProperty('errorId');
    expect(result).toHaveProperty('customEventId');
    
    // Cleanup
    delete process.env.SENTRY_DSN;
  });
});