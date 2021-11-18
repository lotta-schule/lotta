import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Button } from 'shared/general/button/Button';
import { FormResultsDialog } from './FormResultsDialog';

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const Config = React.memo<ConfigProps>(({ contentModule }) => {
    const [isResultsDialogOpen, setIsResultsDialogOpen] = React.useState(false);
    return (
        <div data-testid="FormContentModuleConfiguration">
            <Button
                aria-label={'gespeicherte Daten zeigen'}
                style={{ float: 'right' }}
                onClick={() => setIsResultsDialogOpen(true)}
            >
                Daten ansehen
            </Button>
            <FormResultsDialog
                contentModule={contentModule}
                isOpen={isResultsDialogOpen}
                onRequestClose={() => setIsResultsDialogOpen(false)}
            />
        </div>
    );
});
Config.displayName = 'FormConfig';
