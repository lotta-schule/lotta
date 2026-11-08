import * as React from 'react';
import dynamic from 'next/dynamic.js';
import { Show } from './Show';
import { ContentModuleComponentProps } from '../ContentModule';

import styles from './Table.module.scss';

// The editor is only needed in edit mode, so keep it out of the reader bundle.
const Edit = dynamic(() => import('./Edit').then((m) => m.Edit));

export interface TableCell {
  text: string;
}

export interface TableContent {
  rows: TableCell[][];
}

export type TableConfiguration = Record<never, never>; // Have done nothing yet

export const Table = React.memo(
  ({
    isEditModeEnabled,
    contentModule,
    onUpdateModule,
  }: ContentModuleComponentProps) => {
    return (
      <div className={styles.root} data-testid="TableContentModule">
        {isEditModeEnabled && onUpdateModule && (
          <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
        )}
        {(!isEditModeEnabled || !onUpdateModule) && (
          <Show contentModule={contentModule} />
        )}
      </div>
    );
  }
);
Table.displayName = 'Table';
