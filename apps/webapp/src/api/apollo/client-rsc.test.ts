import { ApolloClient } from '@apollo/client';
import { createRSCClient } from './client-rsc.js';

describe('Apollo RSC Client', () => {
  vi.mock('next/headers.js', () => ({
    headers: () =>
      Promise.resolve({
        get: vi.fn().mockReturnValue('Bearer test-token'),
      }),
    cookies: () =>
      Promise.resolve({
        get: vi.fn().mockReturnValue(undefined),
      }),
  }));

  it('should create an ApolloClient', async () => {
    const client = await createRSCClient();

    expect(client).toBeInstanceOf(ApolloClient);
  });
});
