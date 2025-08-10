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
exports.weeklyCredibilityRecompute = exports.recomputeCredibilityScore = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const calculateCredibilityScore_1 = require("../shared/credibility/calculateCredibilityScore");
const badges_1 = require("../shared/credibility/badges");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
exports.recomputeCredibilityScore = functions.https.onCall(async (data, context) => {
    var _a;
    const { userId, batchMode = false } = data;
    if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    try {
        if (userId) {
            const result = await recomputeUserCredibility(userId);
            return {
                success: true,
                userId,
                credibilityScore: result.credibilityScore,
                message: 'Credibility score updated'
            };
        }
        else if (batchMode) {
            const userDoc = await db.collection('users').doc(context.auth.uid).get();
            const userData = userDoc.data();
            if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', 'Admin access required for batch mode');
            }
            const result = await recomputeAllCredibilityScores();
            return {
                success: true,
                processed: result.processed,
                errors: result.errors,
                message: `Processed ${result.processed} users`
            };
        }
        else {
            throw new functions.https.HttpsError('invalid-argument', 'Either userId or batchMode=true required');
        }
    }
    catch (error) {
        console.error('Error in recompute credibility score:', error);
        throw new functions.https.HttpsError('internal', 'Failed to recompute credibility score');
    }
});
async function recomputeUserCredibility(userId) {
    var _a;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
    }
    const userData = userDoc.data();
    const badges = await getActiveBadgesForUser(userId, userData);
    const credibilityScore = (0, calculateCredibilityScore_1.calculateCredibilityScore)((0, calculateCredibilityScore_1.extractCredibilityFactors)(userData, badges, (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()));
    await userRef.update({ credibilityScore });
    console.log(`Updated credibility score for user ${userId}: ${credibilityScore}`);
    return { credibilityScore };
}
async function recomputeAllCredibilityScores() {
    var _a;
    console.log('Starting batch credibility score recomputation');
    const batchSize = 500;
    let processed = 0;
    let errors = 0;
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
            try {
                const userData = userDoc.data();
                const badges = await getActiveBadgesForUser(userDoc.id, userData);
                const credibilityScore = (0, calculateCredibilityScore_1.calculateCredibilityScore)((0, calculateCredibilityScore_1.extractCredibilityFactors)(userData, badges, (_a = userData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()));
                batch.update(userDoc.ref, { credibilityScore });
                processed++;
            }
            catch (error) {
                console.error(`Error processing user ${userDoc.id}:`, error);
                errors++;
            }
        }
        await batch.commit();
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        console.log(`Processed ${processed} users so far...`);
    }
    console.log(`Batch credibility recomputation complete: ${processed} processed, ${errors} errors`);
    return { processed, errors };
}
async function getActiveBadgesForUser(userId, userData) {
    try {
        if (!userData) {
            const userDoc = await db.collection('users').doc(userId).get();
            userData = userDoc.data();
        }
        if (!(userData === null || userData === void 0 ? void 0 : userData.badgeIds) || userData.badgeIds.length === 0) {
            return [];
        }
        return badges_1.CORE_BADGE_DEFINITIONS.filter((badge) => { var _a; return (_a = userData === null || userData === void 0 ? void 0 : userData.badgeIds) === null || _a === void 0 ? void 0 : _a.includes(badge.id); });
    }
    catch (error) {
        console.error('Error getting user badges:', error);
        return [];
    }
}
exports.weeklyCredibilityRecompute = functions.pubsub
    .schedule('0 3 * * 0')
    .timeZone('UTC')
    .onRun(async () => {
    console.log('Starting weekly credibility score recomputation');
    try {
        const result = await recomputeAllCredibilityScores();
        console.log(`Weekly credibility recompute complete: ${result.processed} processed, ${result.errors} errors`);
        return null;
    }
    catch (error) {
        console.error('Error in weekly credibility recompute:', error);
        throw error;
    }
});
