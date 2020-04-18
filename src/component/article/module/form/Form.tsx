import React, { memo, lazy } from 'react';
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
    element: 'input' | 'selection';
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

export const Form = memo<FormProps>(({ contentModule, isEditModeEnabled, onUpdateModule }) => {
    if (isEditModeEnabled) {
        return (
            <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
        );
    } else {
        return (
            <Show contentModule={contentModule} />
        );
    }
});
