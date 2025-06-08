/** @jest-environment jsdom */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useSidebarToggle } from '../useSidebarToggle';

test('toggle and close update state', () => {
  const result: any = {};
  function Test() {
    Object.assign(result, useSidebarToggle());
    return null;
  }
  const div = document.createElement('div');
  const root = createRoot(div);
  act(() => { root.render(<Test />); });
  expect(result.open).toBe(false);
  act(() => { result.toggle(); });
  expect(result.open).toBe(true);
  act(() => { result.close(); });
  expect(result.open).toBe(false);
});
