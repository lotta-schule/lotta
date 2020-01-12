import React, { memo } from 'react';
import { FormElement as FormElementInterface } from './Form';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';

export interface FormElementProps {
    element: FormElementInterface;
    isEditModeEnabled?: boolean;
}

export const FormElement = memo<FormElementProps>(({ element, isEditModeEnabled }) => {
    if (element.element === 'checkbox') {
        return (
            <FormControlLabel
                control={
                    <Checkbox
                        checked={element.checked}
                        name={element.name}
                        value={'OK'}
                        color={'primary'}
                        disabled={isEditModeEnabled}
                        required={element.required}
                    />
                }
                label={element.label}
            />
        );
    }
    if (element.element === 'input') {
        return (
            <TextField
                fullWidth
                disabled={isEditModeEnabled}
                name={element.name}
                type={element.type}
                label={element.label || undefined}
                placeholder={element.placeholder}
                required={element.required}
                multiline={element.multiline}
                rows={element.rows ?? 4}
            />
        )
    }
    return null;
});