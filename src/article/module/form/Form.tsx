import * as React from 'react';
import { Button } from '@lotta-schule/hubert';

import { ContentModuleModel } from 'model';
import { FormResultsDialog } from './FormResultsDialog';
import { Show } from './Show';
import { Edit } from './Edit';
import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';

export interface FormProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    showResults?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export interface FormElementOption {
    selected?: boolean;
    value: string;
    label?: string;
}

export interface FormElement {
    element: 'input' | 'selection' | 'file';
    name: string;
    type?: string;
    label?: string;
    descriptionText?: string;
    placeholder?: string;
    required?: boolean;
    multiline?: boolean;
    rows?: number;
    options?: FormElementOption[];
}

export interface FormConfiguration {
    destination?: string;
    save_internally?: boolean;
    elements: FormElement[];
}

export const Form = React.memo<FormProps>(
    ({ contentModule, isEditModeEnabled, showResults, onUpdateModule }) => {
        const [isFormResultsDialogOpen, setIsFormResultsDialogOpen] =
            React.useState(false);
        return (
            <div data-testid="FormContentModule">
                {isEditModeEnabled && onUpdateModule && (
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {!isEditModeEnabled && <Show contentModule={contentModule} />}
                {showResults && (
                    <>
                        <Button
                            onClick={() => setIsFormResultsDialogOpen(true)}
                            icon={<Icon icon={faInbox} size={'lg'} />}
                            style={{
                                marginLeft: 'auto',
                                marginRight:
                                    'calc(var(--lotta-spacing) + 16.6%)',
                            }}
                        >
                            Formulareinsendungen sehen
                        </Button>
                        <FormResultsDialog
                            contentModule={contentModule}
                            isOpen={isFormResultsDialogOpen}
                            onRequestClose={() =>
                                setIsFormResultsDialogOpen(false)
                            }
                        />
                    </>
                )}
            </div>
        );
    }
);
Form.displayName = 'Form';
