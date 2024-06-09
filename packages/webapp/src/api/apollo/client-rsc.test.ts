import { ApolloClient } from '@apollo/client';
import { createRSCClient } from './client-rsc';

describe('Apollo RSC Client', () => {
  vi.mock('next/headers', () => ({
    headers: () => ({
      get: vi.fn().mockReturnValue('Bearer test-token'),
    }),
  }));

  it('should create an ApolloClient', () => {
    const client = createRSCClient();

    expect(client).toBeInstanceOf(ApolloClient);
  });
});
