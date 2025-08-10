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
exports.onProfileCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
exports.onProfileCreate = functions.firestore
    .document('users/{uid}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const role = data === null || data === void 0 ? void 0 : data.role;
    if (!role) {
        console.log('No role found for user', context.params.uid);
        return null;
    }
    const templatesSnap = await admin
        .firestore()
        .collection('serviceTemplates')
        .doc(role)
        .collection('templates')
        .get();
    if (templatesSnap.empty) {
        console.log(`No templates for role ${role}`);
        return null;
    }
    const batch = admin.firestore().batch();
    templatesSnap.forEach((doc) => {
        const dest = admin
            .firestore()
            .collection('users')
            .doc(context.params.uid)
            .collection('services')
            .doc(doc.id);
        batch.set(dest, doc.data());
    });
    await batch.commit();
    return null;
});
