import * as React from 'react';
import { Show } from './Show';
import { Edit } from './Edit';
import { ContentModuleComponentProps } from '../ContentModule';

export const Download = React.memo(
  ({
    isEditModeEnabled,
    contentModule,
    onUpdateModule,
  }: ContentModuleComponentProps) => (
    <div data-testid="DownloadContentModule">
      {isEditModeEnabled && onUpdateModule && (
        <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
      )}
      {(!isEditModeEnabled || !onUpdateModule) && (
        <Show contentModule={contentModule} />
      )}
    </div>
  )
);
Download.displayName = 'Download';
