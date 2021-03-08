import React, { memo, lazy } from 'react';
import { CardContent } from '@material-ui/core';
import { ContentModuleModel } from 'model';
import { Show } from './Show';

const Edit = lazy(() => import('./Edit'));

export interface FormProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
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

export const Form = memo<FormProps>(
    ({ contentModule, isEditModeEnabled, onUpdateModule }) => {
        return (
            <CardContent data-testid="FormContentModule">
                {isEditModeEnabled && (
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {!isEditModeEnabled && <Show contentModule={contentModule} />}
            </CardContent>
        );
    }
);
