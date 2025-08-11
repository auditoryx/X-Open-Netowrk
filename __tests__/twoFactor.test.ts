import { 
  generateTwoFactorSecret, 
  generateBackupCodes, 
  verifyTwoFactorToken, 
  isTwoFactorRequiredForRole,
  requiresTwoFactorForOperation,
  TwoFactorRateLimiter
} from '@/lib/auth/twoFactor';

describe('Two-Factor Authentication Utilities', () => {
  describe('generateTwoFactorSecret', () => {
    it('should generate a secret with QR code and backup codes', async () => {
      const result = await generateTwoFactorSecret('test@example.com');
      
      expect(result.secret).toBeTruthy();
      expect(result.qrCodeDataURL).toMatch(/^data:image\/png;base64,/);
      expect(result.backupCodes).toHaveLength(10);
      expect(result.backupCodes[0]).toMatch(/^[A-F0-9]{8}$/);
    });

    it('should generate unique secrets for each call', async () => {
      const result1 = await generateTwoFactorSecret('test1@example.com');
      const result2 = await generateTwoFactorSecret('test2@example.com');
      
      expect(result1.secret).not.toBe(result2.secret);
      expect(result1.backupCodes).not.toEqual(result2.backupCodes);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate 10 backup codes by default', () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(10);
    });

    it('should generate the specified number of codes', () => {
      const codes = generateBackupCodes(5);
      expect(codes).toHaveLength(5);
    });

    it('should generate 8-character hex codes', () => {
      const codes = generateBackupCodes(3);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{8}$/);
      });
    });

    it('should generate unique codes', () => {
      const codes = generateBackupCodes(10);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('verifyTwoFactorToken', () => {
    const mockSecret = 'JBSWY3DPEHPK3PXP'; // base32 encoded
    const mockBackupCodes = ['ABCD1234', 'EFGH5678', 'IJKL9012'];

    it('should reject invalid TOTP tokens', () => {
      const result = verifyTwoFactorToken('000000', mockSecret);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid backup codes', () => {
      const result = verifyTwoFactorToken('ABCD1234', mockSecret, mockBackupCodes);
      expect(result.isValid).toBe(true);
      expect(result.usedBackupCode).toBe('ABCD1234');
      expect(result.remainingBackupCodes).toBe(2);
    });

    it('should reject invalid backup codes', () => {
      const result = verifyTwoFactorToken('INVALID1', mockSecret, mockBackupCodes);
      expect(result.isValid).toBe(false);
    });

    it('should be case insensitive for backup codes', () => {
      const result = verifyTwoFactorToken('abcd1234', mockSecret, mockBackupCodes);
      expect(result.isValid).toBe(true);
      expect(result.usedBackupCode).toBe('ABCD1234');
    });

    it('should handle whitespace in tokens', () => {
      const result = verifyTwoFactorToken(' ABCD1234 ', mockSecret, mockBackupCodes);
      expect(result.isValid).toBe(true);
      expect(result.usedBackupCode).toBe('ABCD1234');
    });
  });

  describe('isTwoFactorRequiredForRole', () => {
    it('should require 2FA for admin roles', () => {
      expect(isTwoFactorRequiredForRole('admin')).toBe(true);
      expect(isTwoFactorRequiredForRole('super_admin')).toBe(true);
      expect(isTwoFactorRequiredForRole('moderator')).toBe(true);
    });

    it('should not require 2FA for regular users', () => {
      expect(isTwoFactorRequiredForRole('user')).toBe(false);
      expect(isTwoFactorRequiredForRole('creator')).toBe(false);
      expect(isTwoFactorRequiredForRole('verified')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isTwoFactorRequiredForRole('ADMIN')).toBe(true);
      expect(isTwoFactorRequiredForRole('Admin')).toBe(true);
    });
  });

  describe('requiresTwoFactorForOperation', () => {
    it('should require 2FA for sensitive operations', () => {
      expect(requiresTwoFactorForOperation('password_change')).toBe(true);
      expect(requiresTwoFactorForOperation('email_change')).toBe(true);
      expect(requiresTwoFactorForOperation('admin_action')).toBe(true);
      expect(requiresTwoFactorForOperation('financial_operation')).toBe(true);
      expect(requiresTwoFactorForOperation('account_deletion')).toBe(true);
      expect(requiresTwoFactorForOperation('role_change')).toBe(true);
    });

    it('should not require 2FA for regular operations', () => {
      expect(requiresTwoFactorForOperation('profile_update')).toBe(false);
      expect(requiresTwoFactorForOperation('message_send')).toBe(false);
      expect(requiresTwoFactorForOperation('booking_create')).toBe(false);
    });
  });

  describe('TwoFactorRateLimiter', () => {
    let rateLimiter: TwoFactorRateLimiter;

    beforeEach(() => {
      rateLimiter = new TwoFactorRateLimiter(3, 60000); // 3 attempts per minute
    });

    it('should not rate limit initially', () => {
      expect(rateLimiter.isRateLimited('user1')).toBe(false);
    });

    it('should rate limit after max attempts', () => {
      const userId = 'user1';
      
      // Record failed attempts
      for (let i = 0; i < 3; i++) {
        rateLimiter.recordFailedAttempt(userId);
      }
      
      expect(rateLimiter.isRateLimited(userId)).toBe(true);
    });

    it('should reset attempts on successful verification', () => {
      const userId = 'user1';
      
      // Record some failed attempts
      rateLimiter.recordFailedAttempt(userId);
      rateLimiter.recordFailedAttempt(userId);
      
      // Reset attempts
      rateLimiter.resetAttempts(userId);
      
      expect(rateLimiter.isRateLimited(userId)).toBe(false);
    });

    it('should provide reset time for rate limited users', () => {
      const userId = 'user1';
      
      // Record max failed attempts
      for (let i = 0; i < 3; i++) {
        rateLimiter.recordFailedAttempt(userId);
      }
      
      expect(rateLimiter.isRateLimited(userId)).toBe(true);
      
      const resetTime = rateLimiter.getResetTime(userId);
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(60000); // Within the window
    });

    it('should handle different users independently', () => {
      const user1 = 'user1';
      const user2 = 'user2';
      
      // Rate limit user1
      for (let i = 0; i < 3; i++) {
        rateLimiter.recordFailedAttempt(user1);
      }
      
      expect(rateLimiter.isRateLimited(user1)).toBe(true);
      expect(rateLimiter.isRateLimited(user2)).toBe(false);
    });
  });
});