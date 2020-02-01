import React, { memo } from 'react';
import { FormElement, FormElementOption } from './Form';
import { Select, MenuItem, TextField, FormControlLabel, Checkbox, makeStyles, Button } from '@material-ui/core';
import { PlusOne } from '@material-ui/icons';

export interface FormElementConfigurationProps {
    element: FormElement;
    updateElement(elm: Partial<FormElement>): void;
}

const useStyles = makeStyles(theme => ({
    configurationProperty: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    option: {
        paddingLeft: theme.spacing(1),
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderLeftWidth: 2,
        borderLeftStyle: 'inset',
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2
    }
}));

export const FormElementConfiguration = memo<FormElementConfigurationProps>(({ element, updateElement }) => {
    const styles = useStyles();
    const updateOption = (index: number, option: Partial<FormElementOption>) => updateElement({
        options: element.options?.map((o, i) => {
            if (i === index) {
                return {
                    ...o,
                    ...option
                };
            }
            return o;
        })
    });
    return (
        <div>
            <Select
                fullWidth
                className={styles.configurationProperty}
                value={element.element}
                onChange={e => updateElement({
                    element: (e.target.value as 'input' | 'selection'),
                    type: e.target.value === 'input' ? 'text' : 'checkbox',
                    options: e.target.value === 'selection' ? [{
                        selected: false,
                        label: 'Auswahl Nummer 1',
                        value: 'a1'
                    }] : []
                })}
            >
                <MenuItem value={'input'}>Eingabefeld</MenuItem>
                <MenuItem value={'selection'}>Auswahl</MenuItem>
            </Select>
            {element.element === 'input' && !element.multiline && (
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
            {element.element === 'selection' && !element.multiline && (
                <Select
                    fullWidth
                    className={styles.configurationProperty}
                    value={element.type}
                    onChange={e => updateElement({ type: (e.target.value as string) })}
                >
                    <MenuItem value={'checkbox'}>Checkbox</MenuItem>
                    <MenuItem value={'radio'}>Radio-Buttons</MenuItem>
                    <MenuItem value={'select'}>Select-Feld</MenuItem>
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
                label={'Aufschrift'}
                value={element.label ?? ''}
                onChange={e => updateElement({ label: (e.target.value as string) })}
            />
            <TextField
                fullWidth
                multiline
                className={styles.configurationProperty}
                id={'form-input-description-text'}
                label={'Beschriftung'}
                value={element.descriptionText ?? ''}
                onChange={e => updateElement({ descriptionText: (e.target.value as string) })}
            />
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
            {element.element === 'selection' && (
                <div>
                    {element.options?.map((option, i) => (
                        <section key={i} className={styles.option}>
                            <TextField
                                fullWidth
                                className={styles.configurationProperty}
                                id={`form-input-option-${i}-label`}
                                label={'Aufschrift'}
                                value={option.label ?? ''}
                                onChange={e => updateOption(i, { label: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                className={styles.configurationProperty}
                                id={`form-input-option-${i}-value`}
                                label={'Wert'}
                                value={option.value ?? ''}
                                onChange={e => updateOption(i, { value: e.target.value })}
                            />
                            <FormControlLabel
                                className={styles.configurationProperty}
                                control={
                                    <Checkbox
                                        checked={option.selected ?? false}
                                        value={'checked'}
                                        color={'primary'}
                                        onChange={(_e, checked) => {
                                            if (element.type === 'radio') {
                                                updateElement({
                                                    options: element.options?.map((_option, _index) => ({
                                                        ..._option,
                                                        selected: checked && i === _index
                                                    }))
                                                })
                                            } else {
                                                updateOption(i, { selected: checked })
                                            }
                                        }}
                                    />
                                }
                                label={'vorausgewählt'}
                            />
                        </section>
                    ))}
                    <Button
                        startIcon={<PlusOne />}
                        onClick={() => updateElement({
                            options: [...(element.options ?? []), { label: `Auswahl Nummer ${(element.options?.length ?? 0) + 1}`, value: `a${(element.options?.length ?? 0) + 1}` }]
                        })}
                    >
                        Antwort hinzufügen
                    </Button>
                </div>
            )}
        </div>
    );
});