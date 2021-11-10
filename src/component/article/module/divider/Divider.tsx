import * as React from 'react';
import { ContentModuleModel } from 'model';
import { CardContent } from '@material-ui/core';
import { Divider as LottaDivider } from 'component/general/divider/Divider';

export interface DividerProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Divider = React.memo<DividerProps>(() => (
    <CardContent data-testid="DividerContentModule">
        <LottaDivider />
    </CardContent>
));
Divider.displayName = 'Divider';
