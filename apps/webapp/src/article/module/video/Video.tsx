import * as React from 'react';
import dynamic from 'next/dynamic.js';
import { Show } from './Show';
import { ContentModuleComponentProps } from '../ContentModule';

// The editor is only needed in edit mode, so keep it out of the reader bundle.
const Edit = dynamic(() => import('./Edit').then((m) => m.Edit));

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
