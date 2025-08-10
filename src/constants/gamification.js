"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTier = exports.TIER_REQUIREMENTS = exports.TIER_WEIGHT = exports.XP_VALUES = void 0;
exports.XP_VALUES = {
    bookingCompleted: 100,
    fiveStarReview: 30,
    referralSignup: 100,
    referralFirstBooking: 50,
    profileCompleted: 25,
    bookingConfirmed: 50,
    onTimeDelivery: 25,
    sevenDayStreak: 40,
    creatorReferral: 150,
};
exports.TIER_WEIGHT = {
    signature: 1.0,
    verified: 0.8,
    standard: 0.5,
};
exports.TIER_REQUIREMENTS = {
    standard: { xp: 0, bookings: 0 },
    verified: { xp: 1000, bookings: 3 },
    signature: { xp: 2000, bookings: 20 }
};
const calculateTier = (xp, bookings) => {
    if (xp >= exports.TIER_REQUIREMENTS.signature.xp && bookings >= exports.TIER_REQUIREMENTS.signature.bookings) {
        return 'signature';
    }
    if (xp >= exports.TIER_REQUIREMENTS.verified.xp && bookings >= exports.TIER_REQUIREMENTS.verified.bookings) {
        return 'verified';
    }
    return 'standard';
};
exports.calculateTier = calculateTier;
