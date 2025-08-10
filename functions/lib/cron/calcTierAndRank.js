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
exports.calcTierAndRank = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
function calcRankScore(factors) {
    const tierWeights = { signature: 1000, verified: 500, standard: 100 };
    const tierWeight = tierWeights[factors.tier] || 100;
    const ratingScore = factors.rating * 20;
    const reviewScore = Math.min(factors.reviews * 2, 100);
    const xpScore = Math.min(factors.xp / 10, 200);
    const responseBonus = factors.responseHrs <= 2 ? 50 : 0;
    return tierWeight + ratingScore + reviewScore + xpScore + responseBonus;
}
if (!admin.apps.length) {
    admin.initializeApp();
}
exports.calcTierAndRank = functions.pubsub
    .schedule('0 17 * * *')
    .timeZone('UTC')
    .onRun(async () => {
    const db = admin.firestore();
    const usersCol = db.collection('users');
    let last = null;
    const batchSize = 500;
    while (true) {
        let q = usersCol
            .where('roles', 'array-contains-any', ['artist', 'producer', 'engineer', 'videographer', 'studio'])
            .orderBy(admin.firestore.FieldPath.documentId())
            .limit(batchSize);
        if (last)
            q = q.startAfter(last);
        const snap = await q.get();
        if (snap.empty)
            break;
        const batch = db.batch();
        snap.docs.forEach((doc) => {
            const data = doc.data();
            const xp = data.xp || data.points || 0;
            const rating = data.averageRating || 0;
            const reviews = data.reviewCount || 0;
            const responseHrs = data.responseHrs || 0;
            const lateDeliveries = data.lateDeliveries || 0;
            const openDisputes = data.openDisputes || 0;
            const tierFrozen = openDisputes > 0;
            let tier = data.tier || data.proTier || 'standard';
            if (!tierFrozen) {
                if (xp >= 2500)
                    tier = 'signature';
                else if (xp >= 500)
                    tier = 'verified';
                else
                    tier = 'standard';
            }
            const rankScore = calcRankScore({
                tier,
                rating,
                reviews,
                xp,
                responseHrs,
                proximityKm: 0,
            });
            const updates = { rankScore, tierFrozen };
            if (tier !== (data.tier || data.proTier)) {
                updates.tier = tier;
                updates.proTier = tier;
            }
            batch.update(doc.ref, updates);
        });
        await batch.commit();
        last = snap.docs[snap.docs.length - 1];
    }
    return null;
});
