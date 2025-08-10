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
exports.onBookingCompleted = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const calculateCredibilityScore_1 = require("../shared/credibility/calculateCredibilityScore");
const badges_1 = require("../shared/credibility/badges");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
exports.onBookingCompleted = functions.firestore
    .document('bookings/{bookingId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const bookingId = context.params.bookingId;
    if (before.status !== 'completed' && after.status === 'completed') {
        console.log(`Processing booking completion: ${bookingId}`);
        try {
            if (!after.isPaid) {
                console.log(`Booking ${bookingId} completed but not paid - skipping credit award`);
                return null;
            }
            if (after.status === 'refunded' || after.status === 'cancelled' || after.wasRefunded) {
                console.log(`Booking ${bookingId} was refunded/cancelled - no credit/badge awarded`);
                return null;
            }
            if (after.creditAwarded) {
                console.log(`Credit already awarded for booking ${bookingId}`);
                return null;
            }
            const providerId = after.providerId;
            const clientId = after.clientId;
            let creditSource = 'client-confirmed';
            if (after.isByoBooking || after.byoInviteId) {
                creditSource = 'ax-verified';
            }
            const bookingUpdateData = {
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
                creditSource,
                creditAwarded: true
            };
            await updateProviderStats(providerId, clientId, creditSource, bookingId);
            await db.collection('bookings').doc(bookingId).update(bookingUpdateData);
            await enqueueReviewPrompt(bookingId, clientId, providerId);
            console.log(`Successfully processed booking completion for ${bookingId}`);
            return null;
        }
        catch (error) {
            console.error(`Error processing booking completion ${bookingId}:`, error);
            throw error;
        }
    }
    return null;
});
async function updateProviderStats(providerId, clientId, creditSource, bookingId) {
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
        const counts = userData.counts || {};
        stats.completedBookings = (stats.completedBookings || 0) + 1;
        stats.lastCompletedAt = admin.firestore.FieldValue.serverTimestamp();
        if (creditSource === 'ax-verified') {
            counts.axVerifiedCredits = (counts.axVerifiedCredits || 0) + 1;
        }
        else if (creditSource === 'client-confirmed') {
            counts.clientConfirmedCredits = (counts.clientConfirmedCredits || 0) + 1;
        }
        await updateDistinctClientsCount(transaction, userRef, clientId, stats);
        const updateData = {
            stats,
            counts
        };
        const badges = await getActiveBadgesForUser(providerId);
        const credibilityScore = (0, calculateCredibilityScore_1.calculateCredibilityScore)((0, calculateCredibilityScore_1.extractCredibilityFactors)({ ...userData, stats, counts }, badges, (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()));
        updateData.credibilityScore = credibilityScore;
        transaction.update(userRef, updateData);
        console.log(`Updated provider ${providerId}: +1 booking, source: ${creditSource}, new credibility: ${credibilityScore}`);
    });
    await checkBadgeEligibility(providerId);
}
async function updateDistinctClientsCount(transaction, userRef, newClientId, stats) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const recentBookingsQuery = db.collection('bookings')
        .where('providerId', '==', userRef.id)
        .where('status', '==', 'completed')
        .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(ninetyDaysAgo));
    const recentBookings = await recentBookingsQuery.get();
    const distinctClients = new Set();
    recentBookings.forEach(doc => {
        const booking = doc.data();
        if (booking.clientId) {
            distinctClients.add(booking.clientId);
        }
    });
    distinctClients.add(newClientId);
    stats.distinctClients90d = distinctClients.size;
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
async function checkBadgeEligibility(userId) {
    var _a;
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists)
            return;
        const userData = userDoc.data();
        const currentBadgeIds = userData.badgeIds || [];
        const stats = userData.stats || {};
        const newBadgeIds = [];
        const completedBookings = stats.completedBookings || 0;
        if (completedBookings >= 1 && !currentBadgeIds.includes('first-booking')) {
            newBadgeIds.push('first-booking');
        }
        if (completedBookings >= 10 && !currentBadgeIds.includes('milestone-10-bookings')) {
            newBadgeIds.push('milestone-10-bookings');
        }
        if (completedBookings >= 50 && !currentBadgeIds.includes('milestone-50-bookings')) {
            newBadgeIds.push('milestone-50-bookings');
        }
        if (completedBookings >= 100 && !currentBadgeIds.includes('milestone-100-bookings')) {
            newBadgeIds.push('milestone-100-bookings');
        }
        const responseRate = stats.responseRate || 0;
        const avgResponseTime = stats.avgResponseTimeHours || 999;
        if (responseRate >= 80 && avgResponseTime <= 2 && !currentBadgeIds.includes('fast-responder')) {
            newBadgeIds.push('fast-responder');
        }
        if (newBadgeIds.length > 0) {
            await db.collection('users').doc(userId).update({
                badgeIds: admin.firestore.FieldValue.arrayUnion(...newBadgeIds)
            });
            console.log(`Awarded badges to user ${userId}:`, newBadgeIds);
            const allBadgeIds = [...currentBadgeIds, ...newBadgeIds];
            const badges = badges_1.CORE_BADGE_DEFINITIONS.filter((badge) => allBadgeIds.includes(badge.id));
            const credibilityScore = (0, calculateCredibilityScore_1.calculateCredibilityScore)((0, calculateCredibilityScore_1.extractCredibilityFactors)(userData, badges, (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()));
            await db.collection('users').doc(userId).update({
                credibilityScore
            });
        }
    }
    catch (error) {
        console.error('Error checking badge eligibility:', error);
    }
}
async function enqueueReviewPrompt(bookingId, clientId, providerId) {
    console.log(`Review prompt queued for booking ${bookingId}, client ${clientId} → provider ${providerId}`);
}
