type Ctx = Record<string, unknown>;
export const Sentry = {
  captureException: (err: unknown, ctx?: Ctx) => console.error('[sentry]', err, ctx),
  captureMessage: (msg: string, ctx?: Ctx) => console.log('[sentry]', msg, ctx),
};
export const withSentry = <T extends (...a: any[]) => any>(h: T) => h;
