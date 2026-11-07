import { ApolloClient, ObservableQuery } from '@apollo/client';

const LISTING_QUERY = 'GetDirectoriesAndFiles';

const settled = (query: ObservableQuery<any>) =>
  new Promise<void>((resolve) => {
    if (!query.getCurrentResult().loading) {
      resolve();
      return;
    }
    const subscription = query.subscribe({
      next: (result) => {
        if (!result.loading) {
          subscription.unsubscribe();
          resolve();
        }
      },
      error: () => {
        subscription.unsubscribe();
        resolve();
      },
    });
  });

/**
 * Reloads the open directory listings after a directory's content changed.
 *
 * A listing requested before the change can be answered after it, and its
 * outdated content is then written over the cache (e.g. a just created
 * directory disappears). So wait for the listings that are still loading, and
 * only then reload them: the up-to-date answer comes last.
 */
export const refreshDirectoryListings = async (client: ApolloClient) => {
  const listings = [...client.getObservableQueries([LISTING_QUERY])];
  await Promise.all(listings.map(settled));
  await client.refetchQueries({ include: [LISTING_QUERY] });
};
