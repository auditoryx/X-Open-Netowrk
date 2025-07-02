import { BookingSlot } from "../types/BookingSlot";

interface User {
  uid: string;
  rank?: 'verified' | 'signature' | 'top5';
  proTier?: 'standard' | 'verified' | 'signature';
  isVerified?: boolean;
  signature?: boolean;
  verified?: boolean;
  email?: string;
}

/**
 * Checks if a user has access to a booking slot
 * 
 * @param slot - The booking slot to check access for
 * @param user - The user requesting access
 * @returns True if the user has access, false otherwise
 */
export function userHasAccessToSlot(slot: BookingSlot, user: User): boolean {
  // If slot is not invite-only, everyone has access
  if (!slot.inviteOnly) {
    return true;
  }

  // Check if user is explicitly allowed (whitelist)
  if (slot.allowedUids && slot.allowedUids.includes(user.uid)) {
    return true;
  }

  // Check if user meets minimum rank requirement
  if (slot.minRank) {
    // Determine user's actual rank from various sources
    const userRank = getUserRank(user);
    
    // Rank hierarchy: top5 > signature > verified
    const rankValues = {
      'verified': 1,
      'signature': 2,
      'top5': 3
    };

    const requiredLevel = rankValues[slot.minRank];
    const userLevel = userRank ? rankValues[userRank] : 0;

    if (userLevel >= requiredLevel) {
      return true;
    }
  }

  // User does not meet any access criteria
  return false;
}

/**
 * Determines user's rank from various properties
 */
function getUserRank(user: User): 'verified' | 'signature' | 'top5' | null {
  // Check explicit rank property first
  if (user.rank) {
    return user.rank;
  }

  // Check signature tier (highest priority)
  if (user.signature || user.proTier === 'signature') {
    return 'signature';
  }

  // Check verified status
  if (user.isVerified || user.verified || user.proTier === 'verified') {
    return 'verified';
  }

  // No qualifying rank
  return null;
}
