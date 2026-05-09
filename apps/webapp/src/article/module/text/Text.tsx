import * as React from 'react';
import { Edit } from './Edit.js';
import { Show } from './Show.js';

import styles from './Text.module.scss';
import { ContentModuleComponentProps } from '../ContentModule.js';

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
