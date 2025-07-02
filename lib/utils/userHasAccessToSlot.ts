import { BookingSlot } from "../types/BookingSlot";

interface User {
  uid: string;
  rank?: 'verified' | 'signature' | 'top5';
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
  if (slot.minRank && user.rank) {
    // Rank hierarchy: top5 > signature > verified
    const rankValues = {
      'verified': 1,
      'signature': 2,
      'top5': 3
    };

    if (rankValues[user.rank] >= rankValues[slot.minRank]) {
      return true;
    }
  }

  // User does not meet any access criteria
  return false;
}
