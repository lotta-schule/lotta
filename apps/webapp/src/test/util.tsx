import * as React from 'react';
import { pick } from 'lodash';
import { HubertProvider } from '@lotta-schule/hubert';
import { InMemoryCache } from '@apollo/client';
import {
  render,
  RenderOptions,
  renderHook,
  Queries,
  queries,
  RenderHookOptions,
} from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ApolloMocksOptions, getDefaultApolloMocks } from 'test/mocks';
import { TranslationsProvider } from 'i18n/client';
import { ServerDataContextProvider } from 'shared/ServerDataContext';
import { tenant } from './fixtures';

export type TestSetupOptions = {
  additionalMocks?: MockedResponse[];
} & ApolloMocksOptions;

export let currentApolloCache: null | InMemoryCache = null;

const ProviderFactory = (options: TestSetupOptions): React.FC => {
  const ComponentClass = ({ children }: { children?: React.ReactNode }) => {
    const { cache, mocks: defaultMocks } = getDefaultApolloMocks(
      pick(options, [
        'currentUser',
        'tenant',
        'categories',
        'userGroups',
        'tags',
        'withCache',
      ])
    );

    currentApolloCache = cache;

    return (
      <TranslationsProvider>
        <ServerDataContextProvider
          tenant={options.tenant ?? tenant}
          socketUrl={'ws://localhost:4000'}
        >
          <HubertProvider>
            <MockedProvider
              mocks={[...defaultMocks, ...(options.additionalMocks || [])]}
              cache={cache}
            >
              <React.Suspense
                fallback={<div>React Suspense is loading...</div>}
              >
                {children}
              </React.Suspense>
            </MockedProvider>
          </HubertProvider>
        </ServerDataContextProvider>
      </TranslationsProvider>
    );
  };

  return ComponentClass;
};

const customRender = (
  ui: React.ReactElement,
  renderOptions: Omit<RenderOptions, 'wrapper'> = {},
  testSetupOptions: TestSetupOptions = {}
) =>
  render(ui, {
    wrapper: ProviderFactory(testSetupOptions),
    ...renderOptions,
  });

const customRenderHook = <
  Result,
  Props,
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  render: (initialProps: Props) => Result,
  options?: Omit<
    RenderHookOptions<Props, Q, Container, BaseElement>,
    'wrapper'
  >,
  testSetupOptions: TestSetupOptions = {}
) =>
  renderHook(render, {
    wrapper: ProviderFactory(testSetupOptions),
    ...options,
  });

// re-export everything
export * from '@testing-library/react';

export const getMetaTagValue = (metaName: string) => {
  const metas = document.getElementsByTagName('meta');
  for (let i = 0; i < metas.length; i += 1) {
    if (
      [
        metas[i].getAttribute('name'),
        metas[i].getAttribute('property'),
      ].includes(metaName)
    ) {
      return metas[i].getAttribute('content');
    }
  }
};

// override render method
export { customRender as render };
export { customRenderHook as renderHook };
