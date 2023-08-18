import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Edit } from './Edit';
import { Show } from './Show';

export interface VideoProps {
  contentModule: ContentModuleModel;
  isEditModeEnabled?: boolean;
  onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Video = React.memo<VideoProps>(
  ({ isEditModeEnabled, contentModule, onUpdateModule }) => (
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
