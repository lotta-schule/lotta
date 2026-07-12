import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { BrowserState, LinearProgress, NodeList } from '@lotta-schule/hubert';
import { makeBrowserNodes } from './makeBrowserNodes';
import {
  GetDirectoriesAndFilesQuery,
  FILES_PAGE_SIZE,
  FILES_INITIAL_FILTER,
} from './_graphql/GetDirectoriesAndFiles';

export const RenderNodeList: BrowserState['renderNodeList'] = React.memo(
  ({ path }) => {
    const parentDirectoryId = path.at(-1)?.id ?? null;
    const sentinelRef = React.useRef<HTMLDivElement>(null);

    const {
      data,
      fetchMore,
      loading: isLoading,
    } = useQuery(GetDirectoriesAndFilesQuery, {
      variables: { parentDirectoryId, filter: FILES_INITIAL_FILTER },
    });

    const nodes = React.useMemo(() => makeBrowserNodes(data), [data]);

    const lastFileId = data?.files?.at(-1)?.id;
    const hasMore = (data?.files?.length ?? 0) >= FILES_PAGE_SIZE;

    React.useEffect(() => {
      if (!hasMore || !sentinelRef.current || !lastFileId) return;

      const sentinel = sentinelRef.current;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // fetchMore re-fetches the full query (directories + files); the
            // directories result is small and will simply replace the cache entry.
            void fetchMore({
              variables: {
                parentDirectoryId,
                filter: { first: FILES_PAGE_SIZE, afterId: lastFileId },
              },
            });
          }
        },
        // rootMargin prefetches before the user hits the absolute bottom
        { threshold: 0, rootMargin: '200px' }
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [hasMore, lastFileId, fetchMore, parentDirectoryId]);

    const footer = hasMore ? (
      <div
        ref={sentinelRef}
        style={{ height: 1, visibility: 'hidden' }}
        aria-hidden="true"
      />
    ) : undefined;

    return (
      <NodeList
        path={path}
        nodes={nodes}
        footer={isLoading ? <LinearProgress /> : footer}
      />
    );
  }
);
RenderNodeList.displayName = 'LottaRenderNodeList';
