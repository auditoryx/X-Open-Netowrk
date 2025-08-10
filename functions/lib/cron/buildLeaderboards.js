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
exports.buildLeaderboards = void 0;
exports.buildLeaderboardData = buildLeaderboardData;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
function buildLeaderboardData(users) {
    const map = {};
    users.forEach((u) => {
        const { city, role, pointsMonth = 0, displayName } = u;
        if (!city || !role)
            return;
        if (!map[city])
            map[city] = {};
        if (!map[city][role])
            map[city][role] = [];
        map[city][role].push({ uid: u.uid, name: displayName, points: pointsMonth });
    });
    Object.values(map).forEach((roles) => {
        Object.keys(roles).forEach((r) => {
            roles[r].sort((a, b) => b.points - a.points);
            roles[r] = roles[r].slice(0, 10);
        });
    });
    return map;
}
exports.buildLeaderboards = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async () => {
    const db = admin.firestore();
    const snap = await db.collection('users').get();
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    const grouped = buildLeaderboardData(users);
    const batch = db.batch();
    Object.entries(grouped).forEach(([city, roles]) => {
        Object.entries(roles).forEach(([role, entries]) => {
            const col = db.collection('leaderboards').doc(city).collection(role);
            entries.forEach((entry) => {
                batch.set(col.doc(entry.uid), entry);
            });
        });
    });
    if (new Date().getDate() === 1) {
        snap.docs.forEach((d) => batch.update(d.ref, { pointsMonth: 0 }));
    }
    await batch.commit();
    return null;
});
