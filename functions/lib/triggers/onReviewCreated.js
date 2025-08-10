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
exports.onReviewCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const calculateCredibilityScore_1 = require("../shared/credibility/calculateCredibilityScore");
const badges_1 = require("../shared/credibility/badges");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
exports.onReviewCreated = functions.firestore
    .document('reviews/{reviewId}')
    .onCreate(async (snap, context) => {
    var _a;
    const reviewData = snap.data();
    const reviewId = context.params.reviewId;
    try {
        console.log(`Processing new review: ${reviewId}`);
        if (!reviewData.rating || reviewData.rating < 4) {
            console.log(`Review ${reviewId} not positive (rating: ${reviewData.rating}) - skipping`);
            return null;
        }
        if (!reviewData.visible || reviewData.status !== 'approved') {
            console.log(`Review ${reviewId} not visible/approved - skipping`);
            return null;
        }
        if (!reviewData.targetId || !reviewData.bookingId) {
            console.log(`Review ${reviewId} missing required fields - skipping`);
            return null;
        }
        const bookingDoc = await db.collection('bookings').doc(reviewData.bookingId).get();
        if (!bookingDoc.exists || ((_a = bookingDoc.data()) === null || _a === void 0 ? void 0 : _a.status) !== 'completed') {
            console.log(`Review ${reviewId} for non-completed booking - skipping`);
            return null;
        }
        const providerId = reviewData.targetId;
        await updateProviderReviewStats(providerId, reviewData.rating);
        console.log(`Successfully processed review creation for ${reviewId}`);
        return null;
    }
    catch (error) {
        console.error(`Error processing review creation ${reviewId}:`, error);
        throw error;
    }
});
async function updateProviderReviewStats(providerId, rating) {
    const userRef = db.collection('users').doc(providerId);
    await db.runTransaction(async (transaction) => {
        var _a;
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            console.warn(`Provider ${providerId} not found`);
            return;
        }
        const userData = userDoc.data();
        const stats = userData.stats || {};
        stats.positiveReviewCount = (stats.positiveReviewCount || 0) + 1;
        const updateData = {
            stats
        };
        const badges = await getActiveBadgesForUser(providerId);
        const credibilityScore = (0, calculateCredibilityScore_1.calculateCredibilityScore)((0, calculateCredibilityScore_1.extractCredibilityFactors)({ ...userData, stats }, badges, (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()));
        updateData.credibilityScore = credibilityScore;
        transaction.update(userRef, updateData);
        console.log(`Updated provider ${providerId}: +1 positive review, new credibility: ${credibilityScore}`);
    });
    await checkReviewBadgeEligibility(providerId);
}
async function getActiveBadgesForUser(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        if (!userData.badgeIds || userData.badgeIds.length === 0) {
            return [];
        }
        return badges_1.CORE_BADGE_DEFINITIONS.filter((badge) => { var _a; return (_a = userData === null || userData === void 0 ? void 0 : userData.badgeIds) === null || _a === void 0 ? void 0 : _a.includes(badge.id); });
    }
    catch (error) {
        console.error('Error getting user badges:', error);
        return [];
    }
}
async function checkReviewBadgeEligibility(userId) {
    var _a;
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists)
            return;
        const userData = userDoc.data();
        const currentBadgeIds = userData.badgeIds || [];
        const stats = userData.stats || {};
        const newBadgeIds = [];
        if (!currentBadgeIds.includes('five-star-streak')) {
            const recentReviews = await getRecentReviews(userId, 90);
            if (hasConsecutiveFiveStarReviews(recentReviews, 5)) {
                newBadgeIds.push('five-star-streak');
            }
        }
        if (!currentBadgeIds.includes('client-favorite') && stats.completedBookings >= 15) {
            const repeatClientRate = await calculateRepeatClientRate(userId);
            if (repeatClientRate >= 0.3) {
                newBadgeIds.push('client-favorite');
            }
        }
        if (newBadgeIds.length > 0) {
            await db.collection('users').doc(userId).update({
                badgeIds: admin.firestore.FieldValue.arrayUnion(...newBadgeIds)
            });
            console.log(`Awarded review-based badges to user ${userId}:`, newBadgeIds);
            const allBadgeIds = [...currentBadgeIds, ...newBadgeIds];
            const badges = badges_1.CORE_BADGE_DEFINITIONS.filter((badge) => allBadgeIds.includes(badge.id));
            const credibilityScore = (0, calculateCredibilityScore_1.calculateCredibilityScore)((0, calculateCredibilityScore_1.extractCredibilityFactors)(userData, badges, (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()));
            await db.collection('users').doc(userId).update({
                credibilityScore
            });
        }
    }
    catch (error) {
        console.error('Error checking review badge eligibility:', error);
    }
}
async function getRecentReviews(providerId, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const reviewsQuery = db.collection('reviews')
        .where('targetId', '==', providerId)
        .where('visible', '==', true)
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(cutoffDate))
        .orderBy('createdAt', 'desc');
    const snapshot = await reviewsQuery.get();
    return snapshot.docs.map(doc => doc.data());
}
function hasConsecutiveFiveStarReviews(reviews, requiredCount) {
    if (reviews.length < requiredCount)
        return false;
    const recentReviews = reviews.slice(0, requiredCount);
    return recentReviews.every(review => review.rating === 5);
}
async function calculateRepeatClientRate(providerId) {
    try {
        const bookingsQuery = db.collection('bookings')
            .where('providerId', '==', providerId)
            .where('status', '==', 'completed');
        const snapshot = await bookingsQuery.get();
        const bookings = snapshot.docs.map(doc => doc.data());
        if (bookings.length === 0)
            return 0;
        const clientCounts = new Map();
        bookings.forEach(booking => {
            if (booking.clientId) {
                clientCounts.set(booking.clientId, (clientCounts.get(booking.clientId) || 0) + 1);
            }
        });
        const repeatClients = Array.from(clientCounts.values()).filter(count => count >= 2).length;
        const totalClients = clientCounts.size;
        return totalClients > 0 ? repeatClients / totalClients : 0;
    }
    catch (error) {
        console.error('Error calculating repeat client rate:', error);
        return 0;
    }
}
