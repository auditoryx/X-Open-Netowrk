import { SCHEMA_FIELDS } from '../SCHEMA_FIELDS';

export type AnalyticsPayload = Record<string, any>;

export function track(event: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;
  try {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag(SCHEMA_FIELDS.XP_TRANSACTION.EVENT, event, payload);
    } else {
      console.debug('track', event, payload);
    }
  } catch (err) {
    console.error('track error', err);
  }
}
