import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60
      },
      include: [
        'src/lib/utils/*.ts',
        'src/lib/stripe/*.ts',
        'src/lib/availability/*.ts',
        'src/lib/firestore/getNextAvailable.ts'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/__tests__/**',
        '**/*.stories.{ts,tsx,js,jsx}',
        '**/index.{ts,tsx,js,jsx}',
        'src/lib/utils/tierProtection.tsx',
        'src/lib/utils/withRoleProtection.tsx',
        'src/lib/utils/checkUserAccess.ts',
        'src/lib/utils/filterByKeyword.ts',
        'src/lib/utils/rankingDataSeeder.ts',
        'src/lib/stripe/createCheckoutSession.ts',
        'src/lib/stripe/createGroupBookingSession.ts',
        'src/lib/stripe/createSubscriptionSession.ts',
        'src/lib/stripe/handleCheckout.ts',
        'src/lib/stripe/initiateBookingWithStripe.ts',
        'src/lib/stripe/updatePayoutStatus.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});