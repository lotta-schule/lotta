import * as React from 'react';
import dynamic from 'next/dynamic.js';
import { Show } from './Show';

import styles from './Text.module.scss';
import { ContentModuleComponentProps } from '../ContentModule';

// The editor is only needed in edit mode, so keep it out of the reader bundle.
const Edit = dynamic(() => import('./Edit').then((m) => m.Edit));

export const Text = React.memo(
  ({
    isEditModeEnabled,
    contentModule,
    onUpdateModule,
  }: ContentModuleComponentProps) => {
    return (
      <div className={styles.root} data-testid="TextContentModule">
        {isEditModeEnabled && onUpdateModule ? (
          <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
        ) : (
          <Show contentModule={contentModule} />
        )}
      </div>
    );
  }
);
Text.displayName = 'Text';
