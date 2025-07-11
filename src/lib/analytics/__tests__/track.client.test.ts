/** @jest-environment jsdom */
import { track } from '../track';

test('calls gtag when present', () => {
  const gtag = jest.fn();
  (window as any).gtag = gtag;
  track('play', { id: 1 });
  expect(gtag).toHaveBeenCalledWith(SCHEMA_FIELDS.XP_TRANSACTION.EVENT, 'play', { id: 1 });
});
