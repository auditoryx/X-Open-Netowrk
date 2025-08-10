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
exports.streakReset = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const gamification_1 = require("../../../src/constants/gamification");
if (!admin.apps.length) {
    admin.initializeApp();
}
const DAY_MS = 24 * 60 * 60 * 1000;
exports.streakReset = functions.pubsub
    .schedule('every day 06:00')
    .timeZone('UTC')
    .onRun(async () => {
    const db = admin.firestore();
    const users = await db.collection('users').get();
    const now = Date.now();
    const batch = db.batch();
    users.docs.forEach((doc) => {
        var _a, _b;
        const data = doc.data();
        const last = ((_a = data.lastActivityAt) === null || _a === void 0 ? void 0 : _a.toMillis)
            ? data.lastActivityAt.toMillis()
            : ((_b = data.lastActivityAt) === null || _b === void 0 ? void 0 : _b.seconds)
                ? data.lastActivityAt.seconds * 1000
                : null;
        if (!last || now - last >= DAY_MS) {
            const streak = data.streakCount || data.streak || 0;
            const award = Math.floor(streak / 7) * gamification_1.XP_VALUES.sevenDayStreak;
            const updates = { streakCount: 0 };
            if (award > 0) {
                updates.xp = admin.firestore.FieldValue.increment(award);
            }
            batch.update(doc.ref, updates);
        }
    });
    await batch.commit();
    console.log(`Streak reset for ${users.size} users.`);
    return null;
});
