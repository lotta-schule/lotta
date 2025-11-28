import { render, waitFor, getMetaTagValue } from 'test/util';
import { FaecherCategory, StartseiteCategory } from 'test/fixtures';
import { CategoryHead } from './CategoryHead';

vi.mock('../../../../../api/client', async () => {
  const { tenant } = await import('test/fixtures');
  const { GET_TENANT_QUERY } = await import('util/tenant');
  const { ApolloClient, InMemoryCache } = await import('@apollo/client');
  const { MockLink } = await import('@apollo/client/testing');
  const client = new ApolloClient({
    cache: new InMemoryCache(),

    link: new MockLink(
      [
        {
          request: {
            query: GET_TENANT_QUERY,
          },
          result: {
            data: {
              tenant,
            },
          },
        },
      ],
      true,
      { showWarnings: true }
    ),
  });
  return {
    getClient: async () => client,
  };
});

describe('shared/category/CategoryHead', () => {
  describe('is homepage', () => {
    it('should show the correct title in the Browser header', async () => {
      render(await CategoryHead({ category: StartseiteCategory }));
      await waitFor(() => {
        expect(document.title).toBe('DerEineVonHier');
        expect(getMetaTagValue('description')).toEqual('DerEineVonHier');
        expect(getMetaTagValue('og:type')).toEqual('website');
      });
    });

    it('show the correct url', async () => {
      render(await CategoryHead({ category: StartseiteCategory }));
      await waitFor(() => {
        expect(getMetaTagValue('og:url')).toEqual('https://info.lotta.schule/');
      });
    });
  });

  describe('is not homepage', () => {
    it('should show the correct title in the Browser header', async () => {
      render(await CategoryHead({ category: FaecherCategory }));
      await waitFor(() => {
        expect(document.title).toBe('Fächer - DerEineVonHier');
        expect(getMetaTagValue('description')).toEqual(
          'Fächer bei DerEineVonHier'
        );
        expect(getMetaTagValue('og:type')).toEqual('website');
      });
    });

    it('show the correct url', async () => {
      render(await CategoryHead({ category: FaecherCategory }));
      await waitFor(() => {
        expect(getMetaTagValue('og:url')).toEqual(
          expect.stringContaining('/c/2-Facher')
        );
      });
    });
  });
});
