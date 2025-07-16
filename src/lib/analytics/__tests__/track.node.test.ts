/** @jest-environment node */
import { track } from '../track';

test('does not throw on server', () => {
  expect(() => track(SCHEMA_FIELDS.XP_TRANSACTION.EVENT)).not.toThrow();
});
