import * as functions from 'firebase-functions';
export declare const expireDynamicBadgesDaily: any;
export declare const assignBadgesIfEligible: functions.https.CallableFunction<any, Promise<{
    success: boolean;
    assignedBadges: number;
    expiredBadges: number;
    newCredibilityScore: number;
}>, unknown>;
