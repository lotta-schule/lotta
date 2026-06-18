import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import { Explorer } from './Explorer';
import { SearchResults } from './SearchResults';

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
