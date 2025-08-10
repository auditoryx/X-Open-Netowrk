import * as functions from 'firebase-functions';
export declare const detectAbusePatterns: functions.https.CallableFunction<any, Promise<{
    success: boolean;
    flags: AbuseFlag[];
    actionsRequired: boolean;
}>, unknown>;
interface AbuseFlag {
    type: 'same_client_abuse' | 'refund_farming' | 'velocity_abuse' | 'suspicious_reviews' | 'fake_account_pattern';
    severity: 'low' | 'medium' | 'high';
    description: string;
    metadata?: Record<string, any>;
}
export {};
