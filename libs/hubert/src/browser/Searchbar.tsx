import * as React from 'react';
import { Input } from '../form';
import { useBrowserState } from './BrowserStateContext';
import { useDebounce } from '../util';
import clsx from 'clsx';

import styles from './Searchbar.module.scss';

export type SearchbarProps = {
  className?: string;
};

export const Searchbar = React.memo(({ className }: SearchbarProps) => {
  const { searchNodes, setCurrentSearchResults } = useBrowserState();
  const [searchtext, setSearchtext] = React.useState('');

  const debouncedSearchtext = useDebounce(searchtext, 750);

  React.useEffect(() => {
    let isCancelled = false;
    if (searchtext.length > 2) {
      searchNodes?.(searchtext).then((results) => {
        if (!isCancelled) {
          setCurrentSearchResults(results);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchtext]);

  if (!searchNodes) {
    return null;
  }
  return (
    <div className={clsx(className, styles.root)}>
      <Input
        placeholder="suchen"
        value={searchtext}
        onChange={(e) => setSearchtext(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            searchNodes(e.currentTarget.value).then((nodes) => {
              setCurrentSearchResults(nodes);
            });
          }
        }}
      />
    </div>
  );
});
Searchbar.displayName = 'Searchbar';
