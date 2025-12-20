import '@testing-library/jest-dom/vitest';

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends TestingLibraryMatchers<
    typeof expect.stringMatching | typeof expect.stringContaining,
    T
  > {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
    unknown,
    unknown
  > {}
}

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
