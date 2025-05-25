"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase-admin/app");
var auth_1 = require("firebase-admin/auth");
(0, app_1.initializeApp)({
    credential: (0, app_1.applicationDefault)(),
    projectId: 'auditory-x-open-network', // 👈 add this line explicitly
});
var uid = 'vod7NQH7FPNZktFg39ZJVwLaVS22';
(0, auth_1.getAuth)()
    .setCustomUserClaims(uid, { admin: true })
    .then(function () {
    console.log("\u2705 Admin claim set for UID: ".concat(uid));
})
    .catch(function (error) {
    console.error('❌ Failed to set admin claim:', error);
});
