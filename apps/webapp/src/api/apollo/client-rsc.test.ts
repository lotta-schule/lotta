import { ApolloClient } from '@apollo/client';
import { createRSCClient } from './client-rsc';

describe('Apollo RSC Client', () => {
  vi.mock('next/headers', () => ({
    headers: () =>
      Promise.resolve({
        get: vi.fn().mockReturnValue('Bearer test-token'),
      }),
  }));

  it('should create an ApolloClient', async () => {
    const client = await createRSCClient();

    expect(client).toBeInstanceOf(ApolloClient);
  });
});
