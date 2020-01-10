import React, { memo } from 'react';
import { ContentModuleModel } from 'model';
import { Edit } from './Edit';
import { Show } from './Show';

export interface FormProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export interface FormElement {
    element: 'input' | 'checkbox';
    name?: string;
    type?: string;
    label?: string;
    placeholder?: string;
    checked?: boolean;
    required?: boolean;
    multiline?: boolean;
    rows?: number;
}

export interface FormConfiguration {
    destination: string;
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
