import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Show } from './Show';
import { Edit } from './Edit';

export interface AudioProps {
  contentModule: ContentModuleModel;
  isEditModeEnabled?: boolean;
  onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Audio = React.memo<AudioProps>(
  ({ isEditModeEnabled, contentModule, onUpdateModule }) => (
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
