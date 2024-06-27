import * as React from 'react';
import { Show } from './Show';
import { Edit } from './Edit';
import { ContentModuleComponentProps } from '../ContentModule';

export const Audio = React.memo(
  ({
    isEditModeEnabled,
    contentModule,
    onUpdateModule,
  }: ContentModuleComponentProps) => (
    <div data-testid="AudioContentModule">
      {isEditModeEnabled && onUpdateModule ? (
        <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
      ) : (
        <Show contentModule={contentModule} />
      )}
    </div>
  )
);
Audio.displayName = 'Audio';
