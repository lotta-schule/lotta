import React, { memo } from 'react';
import {
    Checkbox,
    FormControlLabel,
    TextField,
    Typography,
    FormGroup,
    FormControl,
    RadioGroup,
    Radio,
    InputLabel,
    Select,
    MenuItem,
    FormLabel,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { ButtonGroup } from 'component/general/button/ButtonGroup';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { FormElement as FormElementInterface } from './Form';
import { FileModel } from 'model';
import { Close } from '@material-ui/icons';
import { useCurrentUser } from 'util/user/useCurrentUser';

export interface FormElementProps {
    element: FormElementInterface;
    isEditModeEnabled?: boolean;
    value: string | string[];
    onSetValue(value: string | string[]): void;
}

export const FormElement = memo<FormElementProps>(
    ({ element, isEditModeEnabled, value, onSetValue }) => {
        const currentUser = useCurrentUser();
        const formElement = (() => {
            if (element.element === 'selection') {
                if (element.type === 'checkbox') {
                    return (
                        <FormControl
                            required={element.required}
                            component={'fieldset'}
                        >
                            <FormLabel
                                id={`form-checkbox-label-${element.name!}`}
                            >
                                {element.label}
                            </FormLabel>
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
                                                    checked={
                                                        value instanceof Array
                                                            ? value.indexOf(
                                                                  option.value
                                                              ) > -1
                                                            : false
                                                    }
                                                    onChange={(_e, checked) => {
                                                        const values = (value instanceof
                                                        Array
                                                            ? value
                                                            : [value]
                                                        ).filter(Boolean);
                                                        if (checked) {
                                                            onSetValue([
                                                                ...values,
                                                                option.value,
                                                            ]);
                                                        } else {
                                                            onSetValue(
                                                                values.filter(
                                                                    (v) =>
                                                                        v !==
                                                                        option.value
                                                                )
                                                            );
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
                        <FormControl
                            required={element.required}
                            component={'fieldset'}
                        >
                            <FormLabel id={`form-radio-label-${element.name!}`}>
                                {element.label}
                            </FormLabel>
                            <RadioGroup
                                row={false}
                                value={value ?? ''}
                                onChange={(_e, value) => onSetValue(value)}
                            >
                                {element.options?.map((option, i) => {
                                    return (
                                        <FormControlLabel
                                            key={i}
                                            control={
                                                <Radio
                                                    name={element.name}
                                                    value={option.value}
                                                    title={
                                                        option.label ??
                                                        option.value
                                                    }
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
                        <FormControl
                            required={element.required}
                            component={'fieldset'}
                            fullWidth
                        >
                            <InputLabel
                                htmlFor={`form-select-${element.name!}`}
                            >
                                {element.label}
                            </InputLabel>
                            <Select
                                value={
                                    value ??
                                    element.options?.find((o) => o.selected)
                                        ?.value ??
                                    ''
                                }
                                onChange={({ target: { value } }) =>
                                    onSetValue(value as string)
                                }
                                required={element.required}
                                id={`form-select-${element.name!}`}
                            >
                                {element.options?.map((option, i) => {
                                    return (
                                        <MenuItem key={i} value={option.value}>
                                            {option.label}
                                        </MenuItem>
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
                        inputProps={{
                            'aria-label':
                                element.label ??
                                element.descriptionText ??
                                element.name,
                        }}
                    />
                );
            }
            if (element.element === 'file') {
                const maxSize = 15 * 1024 * 1024; // 15 MB
                return (
                    <>
                        <ButtonGroup style={{ width: '100%' }}>
                            <Button style={{ flex: '0 0 50%' }}>
                                <input
                                    type={'file'}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: '100%',
                                        opacity: 0,
                                        cursor: 'pointer',
                                    }}
                                    onChange={(e) => {
                                        const file = e.target.files?.item(0);
                                        if (file) {
                                            if (file.size > maxSize) {
                                                alert(
                                                    `Die Datei ist zu groß. Die Datei darf höchstens 15 MB groß sein.`
                                                );
                                            } else {
                                                onSetValue(
                                                    `file-upload://${JSON.stringify(
                                                        {
                                                            filesize: file.size,
                                                            filename: file.name,
                                                            filetype: file.type,
                                                            blob: URL.createObjectURL(
                                                                file
                                                            ),
                                                        }
                                                    )}`
                                                );
                                            }
                                        }
                                    }}
                                />
                                {element.label || 'Datei hochladen'}
                            </Button>
                            {currentUser && (
                                <SelectFileButton
                                    label={`Aus 'Meine Dateien' wählen`}
                                    buttonComponentProps={{
                                        style: { flex: '0 0 50%' },
                                        variant: 'contained',
                                        color: 'primary',
                                    }}
                                    onSelect={(file: FileModel) => {
                                        if (file.filesize > maxSize) {
                                            alert(
                                                `Die Datei ist zu groß. Die Datei darf höchstens ${
                                                    maxSize / 1024
                                                } MB groß sein.`
                                            );
                                        } else {
                                            onSetValue(
                                                `lotta-file-id://${JSON.stringify(
                                                    file
                                                )}`
                                            );
                                        }
                                    }}
                                />
                            )}
                        </ButtonGroup>
                        {!value && (
                            <p style={{ marginTop: 0, textAlign: 'right' }}>
                                <small>
                                    max. Dateigröße: {maxSize / (1024 * 1024)}MB
                                </small>
                            </p>
                        )}
                        {value &&
                            /^lotta-file-id:\/\/.+/.test(value as string) && (
                                <p style={{ paddingLeft: '1.5em' }}>
                                    &nbsp;
                                    {
                                        JSON.parse(
                                            (value as string).replace(
                                                /^lotta-file-id:\/\//,
                                                ''
                                            )
                                        ).filename
                                    }
                                    <Button
                                        title={'Auswahl entfernen'}
                                        onClick={() => onSetValue('')}
                                        icon={<Close />}
                                    />
                                </p>
                            )}
                        {value && /^file-upload:\/\/.+/.test(value as string) && (
                            <p style={{ paddingLeft: '1.5em' }}>
                                &nbsp;
                                {
                                    JSON.parse(
                                        (value as string).replace(
                                            /^file-upload:\/\//,
                                            ''
                                        )
                                    ).filename
                                }
                                <Button
                                    title={'Auswahl entfernen'}
                                    onClick={() => onSetValue('')}
                                    icon={<Close />}
                                />
                            </p>
                        )}
                    </>
                );
            }
        })();
        if (formElement) {
            return (
                <section>
                    {element.descriptionText && (
                        <Typography variant={'body1'}>
                            {element.descriptionText}
                        </Typography>
                    )}
                    {formElement}
                </section>
            );
        }
        return null;
    }
);
