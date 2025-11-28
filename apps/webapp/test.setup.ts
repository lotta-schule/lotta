/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@testing-library/jest-dom/vitest';
import * as React from 'react';
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
import { TextEncoder, TextDecoder } from 'util';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { MockRouter, BlobPolyfill, ResizeObserverPolyfill } from 'test/mocks';
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
  let Blob: typeof BlobPolyfill;
}

self.__NEXT_DATA__ = { ...self.__NEXT_DATA__ };

globalThis.Blob = BlobPolyfill;
globalThis.mockRouter = new MockRouter();

globalThis.Blob = BlobPolyfill as any;
(globalThis as any).ResizeObserver = ResizeObserverPolyfill as any;

beforeAll(() => {
  loadDevMessages();
  loadErrorMessages();

  // stub out window.getSelection
  // window.getSelection isn't in jsdom
  // https://github.com/tmpvar/jsdom/issues/937
  (window as any).getSelection = function () {
    return {
      addRange: function () {},
      removeAllRanges: function () {},
    };
  };

  window.location = Object.assign('http://test.lotta.schule', {
    hash: '',
    host: 'test.lotta.schule',
    hostname: 'test.lotta.schule',
    origin: 'http://test.lotta.schule',
    href: 'http://test.lotta.schule',
    port: '',
    pathname: '/',
    search: '' as any,
    protocol: 'http:',
    ancestorOrigins: [] as any,
    reload: () => {},
    replace: () => '',
    assign: (url: string) => Object.assign(window.location, { url: url }),
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

  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
  HTMLElement.prototype.togglePopover = vi.fn();

  // create setup document
  Object.assign(global, { TextDecoder, TextEncoder });

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

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: false,
    value: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
    })),
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: false,
    value: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });

  Element.prototype.scroll = vi.fn(() => {});
  Object.defineProperty(window, 'scrollTo', {
    writable: false,
    value: vi.fn(),
  });

  Element.prototype.scrollIntoView = vi.fn(() => void 0);
  Object.defineProperty(window, 'scrollIntoView', {
    writable: false,
    value: vi.fn(),
  });

  vi.mock('next/head', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactDOMServer = require('react-dom/server');
    return {
      __esModule: true,
      default: ({
        children,
      }: {
        children: Array<React.ReactElement> | React.ReactElement | null;
      }) => {
        if (children) {
          global.document.head.insertAdjacentHTML(
            'afterbegin',
            ReactDOMServer.renderToString(children) || ''
          );
        }
        return null;
      },
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

  vi.mock('next/router', async () => {
    const { MockRouter } = await import('test/mocks/MockRouter');
    globalThis.mockRouter ||= new MockRouter();
    return {
      __esModule: true,
      mockRouter: globalThis.mockRouter,
      useRouter: () => globalThis.mockRouter,
    };
  });

  vi.mock('next/navigation', async () => {
    const { MockRouter } = await import('test/mocks/MockRouter');
    const mockParams = {};
    globalThis.mockRouter ||= new MockRouter();
    return {
      __esModule: true,
      mockRouter: globalThis.mockRouter,
      useRouter: vi.fn(() => globalThis.mockRouter),
      useParams: vi.fn(() => mockParams),
      usePathname: vi.fn(() => globalThis.mockRouter._pathname),
    };
  });

  vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof React>();
    return {
      ...actual,
      cache: vi.fn((fn) => fn),
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
