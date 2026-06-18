import * as React from 'react';
import { useIsMobile } from '../util';
import { useBrowserState } from './BrowserStateContext';
import { FilePreview } from './FilePreview';
import { SearchResultNodeList } from './SearchResultNodeList';
import clsx from 'clsx';

import styles from './Explorer.module.scss';

export type SearchResultsProps = {
  className?: string;
};

export const SearchResults = React.memo(({ className }: SearchResultsProps) => {
  const isMobile = useIsMobile();
  const { isFilePreviewVisible, currentSearchResults } = useBrowserState();

  return (
    <div
      className={clsx(styles.root, className)}
      data-testid="SearchResultNodeList"
    >
      {(!isMobile || !isFilePreviewVisible) && (
        <SearchResultNodeList results={currentSearchResults ?? []} />
      )}
      {(!isMobile || isFilePreviewVisible) && (
        <FilePreview className={styles.nodeInfo} />
      )}
    </div>
  );
});
SearchResults.displayName = 'SearchResults';
