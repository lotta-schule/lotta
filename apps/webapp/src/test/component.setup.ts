/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { MockRouter } from '#/test/mocks/index.js';
import { NEXT_DATA } from 'next/dist/shared/lib/utils.js';
import { DirectoryModel, FileModel } from '#/model/index.js';

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<
    typeof expect.stringMatching | typeof expect.stringContaining,
    T
  > {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
    unknown,
    unknown
  > {}
}

declare module '@lotta-schule/hubert' {
  export interface DefaultFileMetadata extends FileModel {}
  export interface DefaultDirectoryMetadata extends DirectoryModel {}
}

declare global {
  interface Window {
    __NEXT_DATA__: NEXT_DATA;
  }
}
declare namespace globalThis {
  let mockRouter: MockRouter;
}

vi.mock('#/util/browserLocation.js', () => ({
  redirectTo: vi.fn(),
  reload: vi.fn(),
}));

vi.mock('next/config.js', () => ({
  __esModule: true,
  default: () => ({
    publicRuntimeConfig: {
      appEnvironment: '',
      sentryDsn: '',
      socketUrl: '',
    },
  }),
}));

// Both 'next/navigation' and 'next/navigation.js' mocks share the same vi.fn() instances
// so that tests importing one path can mock the router used by components importing the other.
vi.mock('next/navigation', async () => {
  const { MockRouter } = await import('#/test/mocks/MockRouter.js');
  globalThis.mockRouter ||= new MockRouter();
  (globalThis as any).__mockNavigationFns ||= {
    useRouter: vi.fn(() => globalThis.mockRouter),
    useParams: vi.fn(() => ({})),
    usePathname: vi.fn(() => globalThis.mockRouter._pathname),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  };
  return {
    mockRouter: globalThis.mockRouter,
    ...(globalThis as any).__mockNavigationFns,
  };
});

vi.mock('next/navigation.js', async () => {
  const { MockRouter } = await import('#/test/mocks/MockRouter.js');
  globalThis.mockRouter ||= new MockRouter();
  (globalThis as any).__mockNavigationFns ||= {
    useRouter: vi.fn(() => globalThis.mockRouter),
    useParams: vi.fn(() => ({})),
    usePathname: vi.fn(() => globalThis.mockRouter._pathname),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  };
  return {
    mockRouter: globalThis.mockRouter,
    ...(globalThis as any).__mockNavigationFns,
  };
});

self.__NEXT_DATA__ = { ...self.__NEXT_DATA__ };
configure({
  asyncUtilTimeout: 2500,
});

globalThis.mockRouter = new MockRouter();

beforeAll(() => {
  loadDevMessages();
  loadErrorMessages();

  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = true;
  });

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
});

afterEach(() => {
  vi.clearAllMocks();
});
