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
  const {
    searchNodes,
    currentSearchResults,
    setCurrentSearchResults,
    setIsFilePreviewVisible,
    onSelect,
  } = useBrowserState();
  const [searchtext, setSearchtext] = React.useState('');

  const debouncedSearchtext = useDebounce(searchtext, 750);

  React.useEffect(() => {
    let isCancelled = false;
    if (debouncedSearchtext.length > 2) {
      searchNodes?.(searchtext).then((results) => {
        if (!isCancelled) {
          setIsFilePreviewVisible(false);
          setCurrentSearchResults(results);
        }
      });
    }
    if (!debouncedSearchtext) {
      setCurrentSearchResults(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchtext]);

  React.useEffect(() => {
    if (currentSearchResults === null) {
      setSearchtext('');
    }
  }, [currentSearchResults]);

  if (!searchNodes) {
    return null;
  }

  return (
    <section
      className={clsx(className, styles.root, {
        [styles.isShowingSearchResults]: currentSearchResults !== null,
      })}
    >
      <Input
        placeholder="suchen"
        value={searchtext}
        onChange={(e) => setSearchtext(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (currentSearchResults?.length) {
            if (e.key === 'ArrowDown') {
              // select first element
              onSelect([currentSearchResults.at(0)!]);
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.blur();
            }
            if (e.key === 'ArrowUp') {
              onSelect([currentSearchResults.at(-1)!]);
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.blur();
            }
            if (e.key === 'Escape') {
              if (searchtext) {
                setSearchtext('');
              } else {
                e.currentTarget.blur();
              }
            }
          }
        }}
        onBlur={() => {
          if (!currentSearchResults?.length) {
            setSearchtext('');
          }
        }}
      />
    </section>
  );
});
Searchbar.displayName = 'Searchbar';
