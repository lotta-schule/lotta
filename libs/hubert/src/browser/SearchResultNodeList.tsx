import * as React from 'react';
import { BrowserPath, useBrowserState } from './BrowserStateContext';
import { NodeListItem } from './NodeListItem';
import { isFileNode } from './utils';
import clsx from 'clsx';

import styles from './NodeList.module.scss';

export type SearchResultNodeListProps = {
  results: BrowserPath[];
};

export const SearchResultNodeList = React.memo(
  ({ results }: SearchResultNodeListProps) => {
    const { selected, onSelect, setIsFilePreviewVisible, onNavigate } =
      useBrowserState();

    const selectedIds = React.useMemo(
      () => selected.map((s) => s.at(-1)!.id),
      [selected]
    );

    const onKeyDown = React.useCallback(
      (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement && e.target.type === 'text') {
          return;
        }
        if (e.key === 'ArrowDown') {
          const resArray = Array.from(results);
          const lastSelectedPath = Array.from(resArray)
            ?.reverse()
            .find((r) => selectedIds.includes(r.at(-1)!.id));

          if (!lastSelectedPath) {
            return;
          }

          const lastSelectedPathIndex = resArray.indexOf(lastSelectedPath)!;

          const nextSearchResults = results?.at(lastSelectedPathIndex + 1);

          if (
            results.length < 0 ||
            !lastSelectedPath ||
            nextSearchResults === undefined
          ) {
            return;
          }

          onSelect?.([nextSearchResults]);
        }

        if (e.key === 'ArrowUp') {
          const resArray = Array.from(results);
          const lastSelectedPath = resArray.find((r) =>
            selectedIds.includes(r.at(-1)!.id)
          );

          if (!lastSelectedPath) {
            return;
          }

          const lastSelectedPathIndex = results.indexOf(lastSelectedPath)!;

          const nextSearchResults = results[lastSelectedPathIndex - 1];

          if (
            results.length < 0 ||
            !lastSelectedPath ||
            nextSearchResults === undefined
          ) {
            return;
          }

          onSelect?.([nextSearchResults]);
        }
      },
      [onSelect, onNavigate, selected]
    );

    React.useEffect(() => {
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [onKeyDown]);

    if (!results?.length) {
      return <div className={clsx(styles.isEmpty)}>Keine Ergebnisse</div>;
    }

    return (
      <ul role={'listbox'} className={styles.root}>
        {results.map((result) => {
          const node = result.at(-1)!;
          const path = result.slice(0, -1) as BrowserPath<'directory'>;

          const isSelected = selected.some(
            (npath) => npath.at(-1)?.id === node.id
          );
          return (
            <NodeListItem
              key={node.id}
              parentPath={path}
              node={node}
              isSelected={isSelected}
              isEditingDisabled
              onClick={() => {
                onNavigate(isFileNode(node) ? path : path.slice(0, -1));
                onSelect([result]);
                setIsFilePreviewVisible?.(true);
              }}
            />
          );
        })}
      </ul>
    );
  }
);
SearchResultNodeList.displayName = 'SearchResultNodeList';
