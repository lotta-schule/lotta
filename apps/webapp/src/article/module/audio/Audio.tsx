import * as React from 'react';
import { Show } from './Show.js';
import { Edit } from './Edit.js';
import { ContentModuleComponentProps } from '../ContentModule.js';

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
