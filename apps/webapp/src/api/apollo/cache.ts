import { makeVar, Reference } from '@apollo/client';
import { InMemoryCache } from '@apollo/client-integration-nextjs';

export const isMobileDrawerOpenVar = makeVar(false);

export const createCache = () => {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          isMobileDrawerOpen: {
            read() {
              return isMobileDrawerOpenVar();
            },
          },
          files: {
            // Exclude `filter` from the cache key so all pages for a directory
            // merge under one entry, keeping action-hook readQuery/writeQuery
            // calls (which use only parentDirectoryId) pointing at the same slot.
            keyArgs: ['parentDirectoryId'],
            merge(
              existing: Reference[] | undefined,
              incoming: Reference[],
              { args }: { args: { filter?: { afterId?: string } } | null }
            ) {
              // First page (no cursor) replaces; subsequent pages append.
              if (!args?.filter?.afterId) return incoming;
              return [...(existing ?? []), ...incoming];
            },
          },
        },
      },
    },
  });
};
