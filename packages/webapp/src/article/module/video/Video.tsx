import * as React from 'react';
import { Edit } from './Edit';
import { Show } from './Show';
import { ContentModuleComponentProps } from '../ContentModule';

export const Video = React.memo(
  ({
    isEditModeEnabled,
    contentModule,
    onUpdateModule,
  }: ContentModuleComponentProps) => (
    <div style={{ padding: 0 }} data-testid="VideoContentModule">
      {isEditModeEnabled && onUpdateModule ? (
        <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
      ) : (
        <Show contentModule={contentModule} />
      )}
    </div>
  )
);
Video.displayName = 'Video';
