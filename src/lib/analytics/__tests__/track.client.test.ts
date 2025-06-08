/** @jest-environment jsdom */
import { track } from '../track';

test('calls gtag when present', () => {
  const gtag = jest.fn();
  (window as any).gtag = gtag;
  track('play', { id: 1 });
  expect(gtag).toHaveBeenCalledWith('event', 'play', { id: 1 });
});
