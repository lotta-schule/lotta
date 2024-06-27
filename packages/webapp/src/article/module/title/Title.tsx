import * as React from 'react';
import { Edit } from './Edit';
import { Show } from './Show';
import { ContentModuleComponentProps } from '../ContentModule';

import styles from './Title.module.scss';

export const Title = React.memo(
  ({
    isEditModeEnabled,
    contentModule,
    onUpdateModule,
  }: ContentModuleComponentProps) => {
    return (
      <div className={styles.root} data-testid="TitleContentModule">
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
Title.displayName = 'Title';
