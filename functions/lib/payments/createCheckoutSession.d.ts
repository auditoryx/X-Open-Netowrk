import * as functions from 'firebase-functions';
export declare const createCheckoutSession: functions.https.CallableFunction<any, Promise<{
    url: string | null;
}>, unknown>;
