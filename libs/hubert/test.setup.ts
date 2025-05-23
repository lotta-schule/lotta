import { TextEncoder } from 'node:util';
import '@testing-library/jest-dom/vitest';

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = any>
    extends TestingLibraryMatchers<
      typeof expect.stringMatching | typeof expect.stringContaining,
      T
    > {}
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<unknown, unknown> {}
}

// window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Element.prototype.scroll = vi.fn(() => void 0);
Object.defineProperty(window, 'scrollTo', {
  writable: false,
  value: vi.fn(),
});

Element.prototype.scrollIntoView = vi.fn(() => void 0);
Object.defineProperty(window, 'scrollIntoView', {
  writable: false,
  value: vi.fn(),
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: false,
  value: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
  })),
});

HTMLDialogElement.prototype.show = vi.fn(function mock(
  this: HTMLDialogElement
) {
  this.open = true;
});

HTMLDialogElement.prototype.showModal = vi.fn(function mock(
  this: HTMLDialogElement
) {
  this.open = true;
});

HTMLDialogElement.prototype.close = vi.fn(function mock(
  this: HTMLDialogElement
) {
  this.open = false;
});

HTMLElement.prototype.showPopover = vitest.fn();
HTMLElement.prototype.hidePopover = vitest.fn();
HTMLElement.prototype.togglePopover = vitest.fn();

global.TextEncoder = TextEncoder;

const originalError = console.error;
vi.spyOn(console, 'error').mockImplementation((...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('inside a test was not wrapped in act')
  ) {
    return;
  }
  return originalError.call(console, args);
});
