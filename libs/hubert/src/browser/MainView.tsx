import * as React from 'react';
import { useBrowserState } from './BrowserStateContext.js';
import { Explorer } from './Explorer.js';
import { SearchResults } from './SearchResults.js';

export type MainViewProps = {
  className?: string;
};

export const MainView = React.memo(({ className }: MainViewProps) => {
  const { currentSearchResults } = useBrowserState();

  if (currentSearchResults !== null) {
    return <SearchResults className={className} />;
  }

  return <Explorer className={className} />;
});
MainView.displayName = 'MainView';
