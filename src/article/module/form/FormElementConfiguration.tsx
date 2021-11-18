import * as React from 'react';
import { PlusOne } from '@material-ui/icons';
import { Button } from 'shared/general/button/Button';
import { Checkbox } from 'shared/general/form/checkbox';
import { Input } from 'shared/general/form/input/Input';
import { Label } from 'shared/general/label/Label';
import { Select } from 'shared/general/form/select/Select';
import { FormElement, FormElementOption } from './Form';

import styles from './FormElementConfiguration.module.scss';

export interface FormElementConfigurationProps {
    element: FormElement;
    updateElement(elm: Partial<FormElement>): void;
}

export const FormElementConfiguration =
    React.memo<FormElementConfigurationProps>(({ element, updateElement }) => {
        const updateOption = (
            index: number,
            option: Partial<FormElementOption>
        ) =>
            updateElement({
                options: element.options?.map((o, i) => {
                    if (i === index) {
                        return { ...o, ...option };
                    }
                    return o;
                }),
            });
        return (
            <div>
                <Label
                    label={'Art der Eingabe'}
                    className={styles.configurationProperty}
                >
                    <Select
                        value={element.element}
                        onChange={(e) =>
                            updateElement({
                                element: e.currentTarget.value as
                                    | 'input'
                                    | 'selection'
                                    | 'file',
                                type:
                                    e.currentTarget.value === 'input'
                                        ? 'text'
                                        : e.currentTarget.value === 'file'
                                        ? ''
                                        : 'checkbox',
                                options:
                                    e.currentTarget.value === 'selection'
                                        ? [
                                              {
                                                  selected: false,
                                                  label: 'Auswahl Nummer 1',
                                                  value: 'a1',
                                              },
                                          ]
                                        : [],
                            })
                        }
                    >
                        <option value={'input'}>Texteingabefeld</option>
                        <option value={'selection'}>Auswahlbereich</option>
                        <option value={'file'}>Datei-Anhang</option>
                    </Select>
                </Label>
                {element.element === 'input' && !element.multiline && (
                    <Label
                        label={'Texteingabevariation'}
                        className={styles.configurationProperty}
                    >
                        <Select
                            value={element.type}
                            onChange={(e) =>
                                updateElement({
                                    type: e.currentTarget.value as string,
                                })
                            }
                        >
                            <option value={'text'}>Text</option>
                            <option value={'email'}>Email</option>
                            <option value={'url'}>Web-Adresse</option>
                            <option value={'tel'}>Telefonnummer</option>
                            <option value={'time'}>Zeit</option>
                            <option value={'color'}>Farbe</option>
                            <option value={'number'}>Zahl</option>
                            <option value={'password'}>Passwort</option>
                        </Select>
                    </Label>
                )}
                {element.element === 'selection' && (
                    <Label
                        label={'Auswahlfeldvariation'}
                        className={styles.configurationProperty}
                    >
                        <Select
                            value={element.type}
                            onChange={(e) =>
                                updateElement({
                                    type: e.currentTarget.value as string,
                                })
                            }
                        >
                            <option value={'checkbox'}>Checkbox</option>
                            <option value={'radio'}>Radio-Buttons</option>
                            <option value={'select'}>Select-Feld</option>
                        </Select>
                    </Label>
                )}
                <Label label={'Name'} className={styles.configurationProperty}>
                    <Input
                        id={'form-input-name'}
                        value={element.name ?? ''}
                        onChange={(e) =>
                            updateElement({
                                name: e.currentTarget.value as string,
                            })
                        }
                    />
                </Label>
                <Label
                    label={'Aufschrift'}
                    className={styles.configurationProperty}
                >
                    <Input
                        id={'form-input-label'}
                        value={element.label ?? ''}
                        onChange={(e) =>
                            updateElement({
                                label: e.currentTarget.value as string,
                            })
                        }
                    />
                </Label>
                <Label
                    label={'Beschriftung'}
                    className={styles.configurationProperty}
                >
                    <Input
                        multiline
                        id={'form-input-description-text'}
                        value={element.descriptionText ?? ''}
                        onChange={(e) =>
                            updateElement({
                                descriptionText: e.currentTarget.value,
                            })
                        }
                    />
                </Label>
                <Checkbox
                    label={'Pflichtfeld'}
                    checked={element.required ?? false}
                    className={styles.configurationProperty}
                    value={'required'}
                    onChange={(e) =>
                        updateElement({ required: e.currentTarget.checked })
                    }
                />
                {element.element === 'input' && (
                    <Checkbox
                        className={styles.configurationProperty}
                        checked={element.multiline ?? false}
                        label={'mehrzeilig'}
                        value={'multiline'}
                        onChange={(e) =>
                            updateElement({
                                multiline: e.currentTarget.checked,
                            })
                        }
                    />
                )}
                {element.element === 'selection' && (
                    <div>
                        {element.options?.map((option, i) => (
                            <section key={i} className={styles.option}>
                                <Label
                                    label={'Aufschrift'}
                                    className={styles.configurationProperty}
                                >
                                    <Input
                                        id={`form-input-option-${i}-label`}
                                        value={option.label ?? ''}
                                        onChange={(e) =>
                                            updateOption(i, {
                                                label: e.currentTarget.value,
                                            })
                                        }
                                    />
                                </Label>
                                <Label
                                    label={'Wert'}
                                    className={styles.configurationProperty}
                                >
                                    <Input
                                        id={`form-input-option-${i}-value`}
                                        value={option.value ?? ''}
                                        onChange={(e) =>
                                            updateOption(i, {
                                                value: e.currentTarget.value,
                                            })
                                        }
                                    />
                                </Label>
                                <Checkbox
                                    className={styles.configurationProperty}
                                    checked={option.selected ?? false}
                                    label={'vorausgewählt'}
                                    value={'checked'}
                                    onChange={(e) => {
                                        if (element.type === 'radio') {
                                            updateElement({
                                                options: element.options?.map(
                                                    (_option, _index) => ({
                                                        ..._option,
                                                        selected:
                                                            e.currentTarget
                                                                .checked &&
                                                            i === _index,
                                                    })
                                                ),
                                            });
                                        } else {
                                            updateOption(i, {
                                                selected:
                                                    e.currentTarget.checked,
                                            });
                                        }
                                    }}
                                />
                            </section>
                        ))}
                        <Button
                            icon={<PlusOne />}
                            onClick={() =>
                                updateElement({
                                    options: [
                                        ...(element.options ?? []),
                                        {
                                            label: `Auswahl Nummer ${
                                                (element.options?.length ?? 0) +
                                                1
                                            }`,
                                            value: `a${
                                                (element.options?.length ?? 0) +
                                                1
                                            }`,
                                        },
                                    ],
                                })
                            }
                        >
                            Antwort hinzufügen
                        </Button>
                    </div>
                )}
            </div>
        );
    });
FormElementConfiguration.displayName = 'FormElementConfiguration';
