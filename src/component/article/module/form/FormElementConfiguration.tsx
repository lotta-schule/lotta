import React, { memo } from 'react';
import { FormElement } from './Form';
import { Select, MenuItem, TextField, FormControlLabel, Checkbox, makeStyles } from '@material-ui/core';

export interface FormElementConfigurationProps {
    element: FormElement;
    updateElement(elm: Partial<FormElement>): void;
}

const useStyles = makeStyles(theme => ({
    configurationProperty: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }
}));

export const FormElementConfiguration = memo<FormElementConfigurationProps>(({ element, updateElement }) => {
    const styles = useStyles();
    return (
        <div>
            <Select
                fullWidth
                className={styles.configurationProperty}
                value={element.element}
                onChange={e => updateElement({ element: (e.target.value as 'input' | 'checkbox') })}
            >
                <MenuItem value={'input'}>Eingabefeld</MenuItem>
                <MenuItem value={'checkbox'}>Checkbox</MenuItem>
            </Select>
            {element.element === 'input' && (
                <Select
                    fullWidth
                    className={styles.configurationProperty}
                    value={element.type}
                    onChange={e => updateElement({ type: (e.target.value as string) })}
                >
                    <MenuItem value={'text'}>Text</MenuItem>
                    <MenuItem value={'email'}>Email</MenuItem>
                    <MenuItem value={'url'}>Web-Adresse</MenuItem>
                    <MenuItem value={'tel'}>Telefonnummer</MenuItem>
                    <MenuItem value={'time'}>Zeit</MenuItem>
                    <MenuItem value={'color'}>Farbe</MenuItem>
                    <MenuItem value={'number'}>Zahl</MenuItem>
                    <MenuItem value={'password'}>Passwort</MenuItem>
                </Select>
            )}
            <TextField
                fullWidth
                className={styles.configurationProperty}
                id={'form-input-name'}
                label={'Name'}
                value={element.name ?? ''}
                onChange={e => updateElement({ name: (e.target.value as string) })}
            />
            <TextField
                fullWidth
                className={styles.configurationProperty}
                id={'form-input-label'}
                label={'Beschriftung'}
                value={element.label ?? ''}
                onChange={e => updateElement({ label: (e.target.value as string) })}
            />
            {/* {element.element === 'input' && (
                <TextField
                    fullWidth
                    className={styles.configurationProperty}
                    id={'form-input-placeholder'}
                    label={'Platzhalter'}
                    value={element.placeholder}
                    onChange={e => updateElement({ placeholder: (e.target.value as string) })}
                />
            )} */}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={element.required ?? false}
                        className={styles.configurationProperty}
                        value={'required'}
                        color={'primary'}
                        onChange={e => updateElement({ required: e.target.checked })}
                    />
                }
                label={'Pflichtfeld'}
            />
            {element.element === 'input' && (
                <FormControlLabel
                    className={styles.configurationProperty}
                    control={
                        <Checkbox
                            checked={element.multiline ?? false}
                            value={'multiline'}
                            color={'primary'}
                            onChange={e => updateElement({ multiline: e.target.checked })}
                        />
                    }
                    label={'mehrzeilig'}
                />
            )}
            {element.type === 'checkbox' && (
                <FormControlLabel
                    className={styles.configurationProperty}
                    control={
                        <Checkbox
                            checked={element.checked ?? false}
                            value={'checked'}
                            color={'primary'}
                            onChange={e => updateElement({ checked: e.target.checked })}
                        />
                    }
                    label={'vorausgewählt'}
                />
            )}
        </div>
    );
});