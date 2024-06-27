import * as React from 'react';
import { Edit } from './Edit';
import { Show } from './Show';

import styles from './Text.module.scss';
import { ContentModuleComponentProps } from '../ContentModule';

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
