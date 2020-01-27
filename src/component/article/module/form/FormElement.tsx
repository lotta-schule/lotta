import React, { memo } from 'react';
import { FormElement as FormElementInterface } from './Form';
import { Checkbox, FormControlLabel, TextField, Typography, FormGroup, FormControl, RadioGroup, Radio, InputLabel, Select, MenuItem, FormLabel } from '@material-ui/core';

export interface FormElementProps {
    element: FormElementInterface;
    isEditModeEnabled?: boolean;
    value: string | string[];
    onSetValue(value: string | string[]): void;
}

export const FormElement = memo<FormElementProps>(({ element, isEditModeEnabled, value, onSetValue }) => {
    const formElement = (() => {
        if (element.element === 'selection') {
            if (element.type === 'checkbox') {
                return (
                    <FormControl required={element.required} component={'fieldset'}>
                        <FormLabel id={`form-checkbox-label-${element.name!}`}>{element.label}</FormLabel>
                        <FormGroup row={false}>
                            {element.options?.map((option, i) => {
                                return (
                                    <FormControlLabel
                                        key={i}
                                        control={
                                            <Checkbox
                                                name={element.name}
                                                value={option.value}
                                                color={'secondary'}
                                                disabled={isEditModeEnabled}
                                                checked={value instanceof Array ? value.indexOf(option.value) > -1 : false}
                                                onChange={(_e, checked) => {
                                                    const values = (value instanceof Array ? value : [value]).filter(Boolean);
                                                    if (checked) {
                                                        onSetValue([...values, option.value]);
                                                    } else {
                                                        onSetValue(values.filter(v => v !== option.value));
                                                    }
                                                }}
                                            />
                                        }
                                        label={option.label}
                                    />
                                );
                            })}
                        </FormGroup>
                    </FormControl>
                );
            } else if (element.type === 'radio') {
                return (
                    <FormControl required={element.required} component={'fieldset'}>
                        <FormLabel id={`form-radio-label-${element.name!}`}>{element.label}</FormLabel>
                        <RadioGroup row={false} value={value ?? ''} onChange={(_e, value) => onSetValue(value)}>
                            {element.options?.map((option, i) => {
                                return (
                                    <FormControlLabel
                                        key={i}
                                        control={
                                            <Radio
                                                name={element.name}
                                                value={option.value}
                                                color={'secondary'}
                                                disabled={isEditModeEnabled}
                                            />
                                        }
                                        label={option.label}
                                    />
                                );
                            })}
                        </RadioGroup>
                    </FormControl>
                );
            } else if (element.type === 'select') {
                return (
                    <FormControl required={element.required} component={'fieldset'} fullWidth>
                        <InputLabel id={`form-select-label-${element.name!}`}>{element.label}</InputLabel>
                        <Select value={element.options?.find(o => o.selected)?.value ?? ''} onChange={({ target: { value } }) => onSetValue(value as string)} required={element.required}>
                            {element.options?.map((option, i) => {
                                return (
                                    <MenuItem key={i} value={option.value}>{option.label}</MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                );
            }
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
                    value={value ?? ''}
                    onChange={({ target: { value } }) => onSetValue(value)}
                />
            )
        }
    })();
    if (formElement) {
        return (
            <section>
                {element.descriptionText && (
                    <Typography variant={'body1'}>{element.descriptionText}</Typography>
                )}
                {formElement}
            </section>
        )
    }
    return null;
});