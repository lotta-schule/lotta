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
import { beforeAll, vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { MockRouter, BlobPolyfill } from 'test/mocks';
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
  // eslint-disable-next-line @typescript-eslint/no-namespace
  interface Blob {
    new (
      content: BlobPart[],
      options?: BlobPropertyBag
    ): Blob & { readonly inputData: BlobPart[] };
  }
}

self.__NEXT_DATA__ = { ...self.__NEXT_DATA__ };

const mockRouter = new MockRouter();

globalThis.Blob = BlobPolyfill as any;

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

  window.location = {
    hash: '',
    host: 'test.lotta.schule',
    hostname: 'test.lotta.schule',
    origin: 'http://test.lotta.schule',
    href: 'http://test.lotta.schule',
    port: '',
    pathname: '/',
    search: '',
    protocol: 'http:',
    ancestorOrigins: [] as any,
    reload: () => {},
    replace: () => {},
    assign: (url) => Object.assign(window.location, { url: url }),
  };

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

  vi.mock('next/router', () => {
    return {
      __esModule: true,
      mockRouter: mockRouter,
      useRouter: () => mockRouter,
    };
  });

  vi.mock('next/navigation', () => {
    return {
      __esModule: true,
      mockRouter: mockRouter,
      useRouter: () => mockRouter,
    };
  });

  vi.mock('react', () => ({
    ...require('react'),
    cache: vi.fn((fn) => fn),
  }));

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
