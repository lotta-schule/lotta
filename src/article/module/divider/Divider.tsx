import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Divider as LottaDivider } from 'shared/general/divider/Divider';

export interface DividerProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Divider = React.memo<DividerProps>(() => (
    <div data-testid="DividerContentModule">
        <LottaDivider />
    </div>
));
Divider.displayName = 'Divider';
