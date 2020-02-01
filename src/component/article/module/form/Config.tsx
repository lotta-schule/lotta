import React, { memo, useState } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Button } from '@material-ui/core';
import { FormResultsDialog } from './FormResultsDialog';

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const Config = memo<ConfigProps>(({ contentModule }) => {
    const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
    return (
        <>
            <Button
                fullWidth
                color={'primary'}
                aria-label={'gespeicherte Daten zeigen'}
                style={{ float: 'right' }}
                onClick={() => setIsResultsDialogOpen(true)}
            >
                Daten ansehen
            </Button>
            <FormResultsDialog contentModule={contentModule} isOpen={isResultsDialogOpen} onRequestClose={() => setIsResultsDialogOpen(false)} />
        </>
    );
});