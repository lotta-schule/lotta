/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import * as React from 'react';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

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
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { MockRouter } from 'test/mocks';
import { NEXT_DATA } from 'next/dist/shared/lib/utils';
import { DirectoryModel, FileModel } from 'model';

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

  vi.mock('util/browserLocation', async () => {
    return {
      redirectTo: vi.fn(),
      reload: vi.fn(),
    };
  });

  vi.mock('next/head', async () => {
    const ReactDOMServer = await import('react-dom/server');
    return ({
      children,
    }: {
      children: Array<React.ReactElement> | React.ReactElement | null;
    }) => {
      if (children) {
        document.head.insertAdjacentHTML(
          'afterbegin',
          ReactDOMServer.renderToString(children) || ''
        );
      }
      return null;
    };
  });

  vi.mock('next/config', () => ({
    __esModule: true,
    default: () => ({
      publicRuntimeConfig: {
        appEnvironment: '',
        sentryDsn: '',
        socketUrl: '',
      },
    }),
  }));

  vi.mock('next/navigation', async () => {
    const { MockRouter } = await import('test/mocks/MockRouter');
    const mockParams = {};
    globalThis.mockRouter ||= new MockRouter();
    return {
      mockRouter: globalThis.mockRouter,
      useRouter: vi.fn(() => globalThis.mockRouter),
      useParams: vi.fn(() => mockParams),
      usePathname: vi.fn(() => globalThis.mockRouter._pathname),
    };
  });

  // vi.mock('react', async (importOriginal) => {
  //   const actual = await importOriginal<typeof React>();
  //   return {
  //     ...actual,
  //     cache: vi.fn((fn) => fn),
  //   };
  // });

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
