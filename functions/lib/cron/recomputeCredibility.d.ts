import * as functions from 'firebase-functions';
export declare const recomputeCredibilityScore: functions.https.CallableFunction<any, Promise<{
    success: boolean;
    userId: any;
    credibilityScore: number;
    message: string;
    processed?: undefined;
    errors?: undefined;
} | {
    success: boolean;
    processed: number;
    errors: number;
    message: string;
    userId?: undefined;
    credibilityScore?: undefined;
}>, unknown>;
export declare const weeklyCredibilityRecompute: any;
