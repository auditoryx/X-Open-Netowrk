"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectAbusePatterns = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const ABUSE_THRESHOLDS = {
    maxSameClientBookings: 5,
    maxRefundRate: 0.3,
    minTimeBetweenBookings: 1000 * 60 * 60 * 2,
    maxBookingsPerDay: 10,
    suspiciousReviewPattern: 5,
};
exports.detectAbusePatterns = functions.https.onCall(async (data, context) => {
    const { userId, triggerType = 'manual' } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId is required');
    }
    try {
        console.log(`Running abuse detection for user ${userId} (trigger: ${triggerType})`);
        const abuseFlags = await analyzeUserForAbuse(userId);
        if (abuseFlags.length > 0) {
            await flagUserForReview(userId, abuseFlags, triggerType);
            if (abuseFlags.some(flag => flag.severity === 'high')) {
                await freezeUserAccount(userId, 'Automated abuse detection - high severity flags');
            }
        }
        return {
            success: true,
            flags: abuseFlags,
            actionsRequired: abuseFlags.length > 0
        };
    }
    catch (error) {
        console.error('Error in abuse detection:', error);
        throw new functions.https.HttpsError('internal', 'Failed to detect abuse patterns');
    }
});
async function analyzeUserForAbuse(userId) {
    const flags = [];
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return flags;
        }
        const userData = userDoc.data();
        const sameClientFlags = await checkSameClientAbuse(userId);
        flags.push(...sameClientFlags);
        const refundFlags = await checkRefundFarming(userId);
        flags.push(...refundFlags);
        const velocityFlags = await checkBookingVelocityAbuse(userId);
        flags.push(...velocityFlags);
        const reviewFlags = await checkSuspiciousReviewPattern(userId);
        flags.push(...reviewFlags);
        const fakeAccountFlags = await checkFakeAccountPattern(userId, userData);
        flags.push(...fakeAccountFlags);
        console.log(`Abuse analysis for ${userId}: ${flags.length} flags detected`);
        return flags;
    }
    catch (error) {
        console.error('Error analyzing user for abuse:', error);
        return [];
    }
}
async function checkSameClientAbuse(userId) {
    const flags = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    try {
        const recentBookingsQuery = db.collection('bookings')
            .where('providerId', '==', userId)
            .where('status', 'in', ['completed', 'confirmed'])
            .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo));
        const snapshot = await recentBookingsQuery.get();
        const clientCounts = new Map();
        snapshot.docs.forEach(doc => {
            const booking = doc.data();
            if (booking.clientId) {
                clientCounts.set(booking.clientId, (clientCounts.get(booking.clientId) || 0) + 1);
            }
        });
        for (const [clientId, count] of clientCounts.entries()) {
            if (count > ABUSE_THRESHOLDS.maxSameClientBookings) {
                flags.push({
                    type: 'same_client_abuse',
                    severity: count > ABUSE_THRESHOLDS.maxSameClientBookings * 2 ? 'high' : 'medium',
                    description: `${count} bookings from same client (${clientId}) in 30 days`,
                    metadata: { clientId, count, threshold: ABUSE_THRESHOLDS.maxSameClientBookings }
                });
            }
        }
    }
    catch (error) {
        console.error('Error checking same client abuse:', error);
    }
    return flags;
}
async function checkRefundFarming(userId) {
    const flags = [];
    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const bookingsQuery = db.collection('bookings')
            .where('providerId', '==', userId)
            .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(ninetyDaysAgo));
        const snapshot = await bookingsQuery.get();
        let totalBookings = 0;
        let refundedBookings = 0;
        snapshot.docs.forEach(doc => {
            const booking = doc.data();
            totalBookings++;
            if (booking.status === 'cancelled' && booking.refunded) {
                refundedBookings++;
            }
        });
        if (totalBookings >= 10) {
            const refundRate = refundedBookings / totalBookings;
            if (refundRate > ABUSE_THRESHOLDS.maxRefundRate) {
                flags.push({
                    type: 'refund_farming',
                    severity: refundRate > 0.5 ? 'high' : 'medium',
                    description: `High refund rate: ${(refundRate * 100).toFixed(1)}% (${refundedBookings}/${totalBookings})`,
                    metadata: { refundRate, refundedBookings, totalBookings }
                });
            }
        }
    }
    catch (error) {
        console.error('Error checking refund farming:', error);
    }
    return flags;
}
async function checkBookingVelocityAbuse(userId) {
    var _a, _b;
    const flags = [];
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const recentBookingsQuery = db.collection('bookings')
            .where('providerId', '==', userId)
            .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(oneDayAgo))
            .orderBy('createdAt', 'desc');
        const snapshot = await recentBookingsQuery.get();
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (bookings.length > ABUSE_THRESHOLDS.maxBookingsPerDay) {
            flags.push({
                type: 'velocity_abuse',
                severity: 'medium',
                description: `${bookings.length} bookings in 24 hours (limit: ${ABUSE_THRESHOLDS.maxBookingsPerDay})`,
                metadata: { bookingsIn24h: bookings.length, limit: ABUSE_THRESHOLDS.maxBookingsPerDay }
            });
        }
        for (let i = 0; i < bookings.length - 1; i++) {
            const booking1 = bookings[i];
            const booking2 = bookings[i + 1];
            const timeDiff = ((_a = booking1.createdAt) === null || _a === void 0 ? void 0 : _a.toMillis()) - ((_b = booking2.createdAt) === null || _b === void 0 ? void 0 : _b.toMillis());
            if (timeDiff < ABUSE_THRESHOLDS.minTimeBetweenBookings) {
                flags.push({
                    type: 'velocity_abuse',
                    severity: 'low',
                    description: `Bookings created ${Math.round(timeDiff / 1000 / 60)} minutes apart`,
                    metadata: { timeDiff, minRequired: ABUSE_THRESHOLDS.minTimeBetweenBookings }
                });
                break;
            }
        }
    }
    catch (error) {
        console.error('Error checking booking velocity:', error);
    }
    return flags;
}
async function checkSuspiciousReviewPattern(userId) {
    var _a;
    const flags = [];
    try {
        const recentReviewsQuery = db.collection('reviews')
            .where('targetId', '==', userId)
            .where('visible', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(10);
        const snapshot = await recentReviewsQuery.get();
        const reviews = snapshot.docs.map(doc => doc.data());
        let consecutivePerfect = 0;
        let newClientPerfect = 0;
        for (const review of reviews) {
            if (review.rating === 5) {
                consecutivePerfect++;
                const reviewerDoc = await db.collection('users').doc(review.authorId).get();
                if (reviewerDoc.exists) {
                    const reviewerData = reviewerDoc.data();
                    const accountAge = Date.now() - ((_a = reviewerData.createdAt) === null || _a === void 0 ? void 0 : _a.toMillis());
                    const isNewAccount = accountAge < (1000 * 60 * 60 * 24 * 7);
                    if (isNewAccount) {
                        newClientPerfect++;
                    }
                }
            }
            else {
                break;
            }
        }
        if (consecutivePerfect >= ABUSE_THRESHOLDS.suspiciousReviewPattern &&
            newClientPerfect >= Math.floor(consecutivePerfect * 0.7)) {
            flags.push({
                type: 'suspicious_reviews',
                severity: 'medium',
                description: `${consecutivePerfect} consecutive 5-star reviews, ${newClientPerfect} from new accounts`,
                metadata: { consecutivePerfect, newClientPerfect }
            });
        }
    }
    catch (error) {
        console.error('Error checking review patterns:', error);
    }
    return flags;
}
async function checkFakeAccountPattern(userId, userData) {
    var _a;
    const flags = [];
    try {
        const hasMinimalProfile = !userData.bio || !userData.media || userData.media.length === 0;
        const stats = userData.stats || {};
        const hasHighActivity = (stats.completedBookings || 0) > 10;
        if (hasMinimalProfile && hasHighActivity) {
            flags.push({
                type: 'fake_account_pattern',
                severity: 'low',
                description: 'High booking activity with minimal profile information',
                metadata: { completedBookings: stats.completedBookings }
            });
        }
        const accountAgeMs = Date.now() - (((_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toMillis()) || Date.now());
        const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);
        if (accountAgeDays < 30 && hasHighActivity) {
            flags.push({
                type: 'fake_account_pattern',
                severity: 'low',
                description: `Very new account (${Math.round(accountAgeDays)} days) with high activity`,
                metadata: { accountAgeDays, completedBookings: stats.completedBookings }
            });
        }
    }
    catch (error) {
        console.error('Error checking fake account patterns:', error);
    }
    return flags;
}
async function flagUserForReview(userId, flags, triggerType) {
    const flagDoc = {
        userId,
        flags,
        triggerType,
        status: 'pending_review',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        resolution: null
    };
    await db.collection('abuseFlags').add(flagDoc);
    console.log(`User ${userId} flagged for review with ${flags.length} flags`);
}
async function freezeUserAccount(userId, reason) {
    await db.collection('users').doc(userId).update({
        tierFrozen: true,
        freezeReason: reason,
        frozenAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`User ${userId} account frozen: ${reason}`);
}
