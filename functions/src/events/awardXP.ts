import { logXpEvent } from '../../../src/lib/gamification'

/**
 * Award XP when a booking is completed.
 */
export async function onBookingCompleted(
  uid: string,
  bookingId?: string,
) {
  await logXpEvent(uid, 'bookingConfirmed', bookingId ? { contextId: bookingId } : {})
}

/**
 * Award XP when a 5-star review is created.
 */
export async function onReviewCreated(
  uid: string,
  reviewId?: string,
) {
  await logXpEvent(uid, 'fiveStarReview', reviewId ? { contextId: reviewId } : {})
}

/**
 * Award XP for successful referrals.
 */
export async function onReferral(uid: string) {
  await logXpEvent(uid, 'creatorReferral')
}
