import { ApolloClient } from '@apollo/client';
import { createRSCClient } from './client-rsc';

describe('Apollo RSC Client', () => {
  it('should create an ApolloClient', () => {
    const client = createRSCClient();

    expect(client).toBeInstanceOf(ApolloClient);
  });
});
