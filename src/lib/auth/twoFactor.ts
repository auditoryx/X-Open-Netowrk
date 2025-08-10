/**
 * Two-Factor Authentication Utility Library
 * 
 * Provides shared utilities for TOTP-based 2FA implementation
 * Compatible with Google Authenticator, Authy, and other TOTP apps
 */

import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import QRCode from 'qrcode';

export interface TwoFactorSecret {
  secret: string;
  qrCodeDataURL: string;
  backupCodes: string[];
}

export interface TwoFactorVerificationResult {
  isValid: boolean;
  usedBackupCode?: string;
  remainingBackupCodes?: number;
}

/**
 * Generate a new 2FA secret and QR code
 */
export async function generateTwoFactorSecret(
  accountName: string, 
  serviceName: string = 'X-Open-Network'
): Promise<TwoFactorSecret> {
  // Generate secret for TOTP
  const secret = authenticator.generateSecret();
  
  // Create the TOTP URL for QR code
  const otpUrl = authenticator.keyuri(accountName, serviceName, secret);
  
  // Generate QR code
  const qrCodeDataURL = await QRCode.toDataURL(otpUrl);
  
  // Generate backup codes
  const backupCodes = generateBackupCodes(10);
  
  return {
    secret,
    qrCodeDataURL,
    backupCodes
  };
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Verify a TOTP token or backup code
 */
export function verifyTwoFactorToken(
  token: string,
  secret: string,
  backupCodes: string[] = []
): TwoFactorVerificationResult {
  // Clean up the token
  const cleanToken = token.replace(/\s/g, '').toUpperCase();
  
  // Check if token is a TOTP code (6 digits)
  if (cleanToken.length === 6 && /^\d+$/.test(cleanToken)) {
    const isValid = authenticator.check(cleanToken, secret);
    return { isValid };
  }
  
  // Check if token is a backup code (8 hex characters)
  if (cleanToken.length === 8 && /^[A-F0-9]+$/.test(cleanToken)) {
    if (backupCodes.includes(cleanToken)) {
      return {
        isValid: true,
        usedBackupCode: cleanToken,
        remainingBackupCodes: backupCodes.length - 1
      };
    }
  }
  
  return { isValid: false };
}

/**
 * Check if 2FA is required for admin accounts
 */
export function isTwoFactorRequiredForRole(role: string): boolean {
  const adminRoles = ['admin', 'super_admin', 'moderator'];
  return adminRoles.includes(role.toLowerCase());
}

/**
 * Generate a time-based window for TOTP verification (useful for clock skew)
 */
export function verifyTwoFactorTokenWithWindow(
  token: string,
  secret: string,
  window: number = 1
): boolean {
  return authenticator.check(token, secret, { window });
}

/**
 * Check if sensitive operation requires 2FA verification
 */
export function requiresTwoFactorForOperation(operation: string): boolean {
  const sensitiveOperations = [
    'password_change',
    'email_change', 
    'admin_action',
    'financial_operation',
    'account_deletion',
    'role_change'
  ];
  return sensitiveOperations.includes(operation);
}

/**
 * Rate limiting helper for 2FA attempts
 */
export class TwoFactorRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if user is rate limited
   */
  isRateLimited(userId: string): boolean {
    const userAttempts = this.attempts.get(userId);
    if (!userAttempts) return false;

    const now = Date.now();
    if (now - userAttempts.lastAttempt > this.windowMs) {
      // Reset if window has passed
      this.attempts.delete(userId);
      return false;
    }

    return userAttempts.count >= this.maxAttempts;
  }

  /**
   * Record a failed attempt
   */
  recordFailedAttempt(userId: string): void {
    const now = Date.now();
    const userAttempts = this.attempts.get(userId);

    if (!userAttempts || now - userAttempts.lastAttempt > this.windowMs) {
      this.attempts.set(userId, { count: 1, lastAttempt: now });
    } else {
      userAttempts.count++;
      userAttempts.lastAttempt = now;
    }
  }

  /**
   * Reset attempts for successful verification
   */
  resetAttempts(userId: string): void {
    this.attempts.delete(userId);
  }

  /**
   * Get remaining time until rate limit reset
   */
  getResetTime(userId: string): number {
    const userAttempts = this.attempts.get(userId);
    if (!userAttempts) return 0;

    const resetTime = userAttempts.lastAttempt + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}

// Global rate limiter instance
export const twoFactorRateLimiter = new TwoFactorRateLimiter();