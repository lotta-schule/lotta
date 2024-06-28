import { createSSRClient } from './client-ssr';
import { tenant } from 'test/fixtures';
import { NextSSRApolloClient } from '@apollo/experimental-nextjs-app-support/ssr';

describe('Apollo SSR Client', () => {
  it('should create an ApolloClient', () => {
    const client = createSSRClient(tenant);

    expect(client).toBeInstanceOf(NextSSRApolloClient);
  });
});
