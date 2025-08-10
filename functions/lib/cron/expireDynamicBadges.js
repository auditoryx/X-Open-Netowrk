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
exports.assignBadgesIfEligible = exports.expireDynamicBadgesDaily = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const badges_1 = require("../shared/credibility/badges");
const calculateCredibilityScore_1 = require("../shared/credibility/calculateCredibilityScore");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
exports.expireDynamicBadgesDaily = functions.pubsub
    .schedule('0 6 * * *')
    .timeZone('UTC')
    .onRun(async () => {
    console.log('Starting daily dynamic badge expiry and refresh');
    try {
        const batchSize = 500;
        let processedUsers = 0;
        let expiredBadges = 0;
        let assignedBadges = 0;
        let lastDoc = null;
        while (true) {
            let query = db.collection('users')
                .where('roles', 'array-contains-any', ['artist', 'producer', 'engineer', 'videographer', 'studio'])
                .orderBy(admin.firestore.FieldPath.documentId())
                .limit(batchSize);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }
            const snapshot = await query.get();
            if (snapshot.empty)
                break;
            const batch = db.batch();
            for (const userDoc of snapshot.docs) {
                const userData = userDoc.data();
                if (!userData.badgeIds || userData.badgeIds.length === 0) {
                    continue;
                }
                const result = await processDynamicBadgesForUser(userDoc.id, userData);
                if (result.hasChanges) {
                    batch.update(userDoc.ref, {
                        badgeIds: result.updatedBadgeIds,
                        credibilityScore: result.updatedCredibilityScore
                    });
                    expiredBadges += result.expiredCount;
                    assignedBadges += result.assignedCount;
                }
            }
            await batch.commit();
            processedUsers += snapshot.docs.length;
            lastDoc = snapshot.docs[snapshot.docs.length - 1];
            console.log(`Processed ${processedUsers} users so far...`);
        }
        console.log(`Daily badge maintenance complete: ${processedUsers} users processed, ${expiredBadges} badges expired, ${assignedBadges} badges assigned`);
        return null;
    }
    catch (error) {
        console.error('Error in daily badge maintenance:', error);
        throw error;
    }
});
async function processDynamicBadgesForUser(userId, userData) {
    var _a, _b;
    const currentBadgeIds = userData.badgeIds || [];
    let updatedBadgeIds = [...currentBadgeIds];
    let hasChanges = false;
    let expiredCount = 0;
    let assignedCount = 0;
    const now = new Date();
    const userBadgesQuery = db.collection('userBadges')
        .where('userId', '==', userId)
        .where('expiresAt', '<=', admin.firestore.Timestamp.fromDate(now))
        .where('status', '==', 'active');
    const expiredBadgesSnap = await userBadgesQuery.get();
    for (const badgeDoc of expiredBadgesSnap.docs) {
        const badgeData = badgeDoc.data();
        const badgeId = badgeData.badgeId;
        if (currentBadgeIds.includes(badgeId)) {
            updatedBadgeIds = updatedBadgeIds.filter(id => id !== badgeId);
            hasChanges = true;
            expiredCount++;
            await badgeDoc.ref.update({ status: 'expired' });
            console.log(`Expired badge ${badgeId} for user ${userId}`);
        }
    }
    const newBadges = await checkDynamicBadgeEligibility(userId, userData, updatedBadgeIds);
    if (newBadges.length > 0) {
        updatedBadgeIds.push(...newBadges);
        hasChanges = true;
        assignedCount = newBadges.length;
        for (const badgeId of newBadges) {
            const badge = badges_1.CORE_BADGE_DEFINITIONS.find((b) => b.id === badgeId);
            if (badge && badge.type === 'dynamic') {
                const expiresAt = new Date();
                let ttlDays = 30;
                switch (badgeId) {
                    case 'trending-now':
                        ttlDays = 7;
                        break;
                    case 'rising-talent':
                        ttlDays = 30;
                        break;
                    case 'new-this-week':
                        ttlDays = 14;
                        break;
                }
                expiresAt.setDate(expiresAt.getDate() + ttlDays);
                await db.collection('userBadges').add({
                    userId,
                    badgeId,
                    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'active',
                    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
                    metadata: {
                        autoAssigned: true
                    }
                });
            }
        }
        console.log(`Assigned dynamic badges to user ${userId}:`, newBadges);
    }
    let updatedCredibilityScore = userData.credibilityScore || 0;
    if (hasChanges) {
        const activeBadges = badges_1.CORE_BADGE_DEFINITIONS.filter((badge) => updatedBadgeIds.includes(badge.id));
        updatedCredibilityScore = (0, calculateCredibilityScore_1.calculateCredibilityScore)((0, calculateCredibilityScore_1.extractCredibilityFactors)(userData, activeBadges, ((_b = (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date()));
    }
    return {
        hasChanges,
        updatedBadgeIds,
        updatedCredibilityScore,
        expiredCount,
        assignedCount
    };
}
async function shouldExpireBadge(userId, badge) {
    var _a;
    if (!((_a = badge.criteria) === null || _a === void 0 ? void 0 : _a.ttlDays))
        return false;
    const ttlDays = badge.criteria.ttlDays;
    switch (badge.id) {
        case 'trending-now':
            return !(await hasRecentActivity(userId, 7));
        case 'rising-talent':
            return !(await hasRecentActivity(userId, 30));
        case 'new-this-week':
            return await isAccountOlderThan(userId, 14);
        default:
            return false;
    }
}
async function hasRecentActivity(userId, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const recentBookingsQuery = db.collection('bookings')
        .where('providerId', '==', userId)
        .where('status', '==', 'completed')
        .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(cutoffDate))
        .limit(1);
    const snapshot = await recentBookingsQuery.get();
    return !snapshot.empty;
}
async function isAccountOlderThan(userId, days) {
    var _a;
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists)
        return true;
    const userData = userDoc.data();
    const createdAt = ((_a = userData === null || userData === void 0 ? void 0 : userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date();
    const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreation > days;
}
async function checkDynamicBadgeEligibility(userId, userData, currentBadgeIds) {
    const newBadges = [];
    const stats = userData.stats || {};
    if (!currentBadgeIds.includes('new-this-week')) {
        const isNewUser = await isAccountOlderThan(userId, 7);
        if (!isNewUser) {
            newBadges.push('new-this-week');
        }
    }
    if (!currentBadgeIds.includes('trending-now')) {
        const recentBookingCount = await getRecentBookingCount(userId, 7);
        if (recentBookingCount >= 2) {
            newBadges.push('trending-now');
        }
    }
    if (!currentBadgeIds.includes('rising-talent')) {
        const recentBookingCount = await getRecentBookingCount(userId, 30);
        const isRecentAccount = !(await isAccountOlderThan(userId, 90));
        if (recentBookingCount >= 3 && isRecentAccount) {
            newBadges.push('rising-talent');
        }
    }
    return newBadges;
}
async function getRecentBookingCount(userId, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const recentBookingsQuery = db.collection('bookings')
        .where('providerId', '==', userId)
        .where('status', '==', 'completed')
        .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(cutoffDate));
    const snapshot = await recentBookingsQuery.get();
    return snapshot.size;
}
exports.assignBadgesIfEligible = functions.https.onCall(async (data, context) => {
    var _a;
    if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const { userId, force = false } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId is required');
    }
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        const result = await processDynamicBadgesForUser(userId, userData);
        if (result.hasChanges || force) {
            await db.collection('users').doc(userId).update({
                badgeIds: result.updatedBadgeIds,
                credibilityScore: result.updatedCredibilityScore
            });
        }
        return {
            success: true,
            assignedBadges: result.assignedCount,
            expiredBadges: result.expiredCount,
            newCredibilityScore: result.updatedCredibilityScore
        };
    }
    catch (error) {
        console.error('Error in manual badge assignment:', error);
        throw new functions.https.HttpsError('internal', 'Failed to assign badges');
    }
});
