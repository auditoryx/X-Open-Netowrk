/** @jest-environment node */
import { track } from '../track';

test('does not throw on server', () => {
  expect(() => track('event')).not.toThrow();
});
