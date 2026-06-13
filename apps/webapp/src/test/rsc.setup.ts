/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
// import { resetApolloClientSingletons } from '@apollo/client-integration-nextjs';
import { MockRouter } from './mocks/index.js';
import { NEXT_DATA } from 'next/dist/shared/lib/utils.js';
import { DirectoryModel, FileModel } from '../model/index.js';

// afterEach(resetApolloClientSingletons);

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
    Blob: new (
      content: BlobPart[],
      options?: BlobPropertyBag
    ) => Blob & { readonly inputData: BlobPart[] };
  }
  interface Blob {
    new (
      content: BlobPart[],
      options?: BlobPropertyBag
    ): Blob & { readonly inputData: BlobPart[] };
  }
}

declare namespace globalThis {
  // oxlint-disable-next-line no-unused-vars
  let mockRouter: MockRouter;
}

self.__NEXT_DATA__ = { ...self.__NEXT_DATA__ };
configure({
  asyncUtilTimeout: 2500, // default is 1000ms, increase for browser tests
});

globalThis.mockRouter = new MockRouter();

beforeAll(() => {
  loadDevMessages();
  loadErrorMessages();

  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = true;
  });

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

  vi.mock('next/navigation.js', async () => {
    const { MockRouter } = await import('./mocks/MockRouter.js');
    const mockParams = {};
    globalThis.mockRouter ||= new MockRouter();
    return {
      mockRouter: globalThis.mockRouter,
      useRouter: vi.fn(() => globalThis.mockRouter),
      useParams: vi.fn(() => mockParams),
      usePathname: vi.fn(() => globalThis.mockRouter._pathname),
    };
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
