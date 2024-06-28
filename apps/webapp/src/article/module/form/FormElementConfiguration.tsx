import * as React from 'react';
import {
  Button,
  Checkbox,
  Input,
  Label,
  Option,
  Select,
} from '@lotta-schule/hubert';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';
import { FormElement, FormElementOption } from './Form';

import styles from './FormElementConfiguration.module.scss';

export interface FormElementConfigurationProps {
  element: FormElement;
  updateElement(elm: Partial<FormElement>): void;
}

export const FormElementConfiguration = React.memo(
  ({ element, updateElement }: FormElementConfigurationProps) => {
    const updateOption = (index: number, option: Partial<FormElementOption>) =>
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
        <Select
          fullWidth
          title={'Art der Eingabe'}
          className={styles.configurationProperty}
          value={element.element}
          onChange={(element) =>
            updateElement({
              element: element as 'input' | 'file' | 'selection',
              type:
                element === 'input'
                  ? 'text'
                  : element === 'file'
                    ? ''
                    : 'checkbox',
              options:
                element === 'selection'
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
          <Option value={'input'}>Texteingabefeld</Option>
          <Option value={'selection'}>Auswahlbereich</Option>
          <Option value={'file'}>Datei-Anhang</Option>
        </Select>
        {element.element === 'input' && !element.multiline && (
          <Select
            fullWidth
            title={'Texteingabevariation'}
            className={styles.configurationProperty}
            value={element.type}
            onChange={(type) =>
              updateElement({
                type,
              })
            }
          >
            <Option value={'text'}>Text</Option>
            <Option value={'email'}>Email</Option>
            <Option value={'url'}>Web-Adresse</Option>
            <Option value={'tel'}>Telefonnummer</Option>
            <Option value={'time'}>Zeit</Option>
            <Option value={'color'}>Farbe</Option>
            <Option value={'number'}>Zahl</Option>
            <Option value={'password'}>Passwort</Option>
          </Select>
        )}
        {element.element === 'selection' && (
          <Select
            fullWidth
            title={'Auswahlfeldvariation'}
            className={styles.configurationProperty}
            value={element.type}
            onChange={(type) =>
              updateElement({
                type,
              })
            }
          >
            <Option value={'checkbox'}>Checkbox</Option>
            <Option value={'radio'}>Radio-Buttons</Option>
            <Option value={'select'}>Select-Feld</Option>
          </Select>
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
        <Label label={'Aufschrift'} className={styles.configurationProperty}>
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
        <Label label={'Beschriftung'} className={styles.configurationProperty}>
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
          isSelected={element.required ?? false}
          className={styles.configurationProperty}
          value={'required'}
          onChange={(isSelected) => updateElement({ required: isSelected })}
        >
          Pflichtfeld
        </Checkbox>
        {element.element === 'input' && (
          <Checkbox
            className={styles.configurationProperty}
            isSelected={element.multiline ?? false}
            value={'multiline'}
            onChange={(isSelected) =>
              updateElement({
                multiline: isSelected,
              })
            }
          >
            mehrzeilig
          </Checkbox>
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
                <Label label={'Wert'} className={styles.configurationProperty}>
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
                  isSelected={option.selected ?? false}
                  value={'checked'}
                  onChange={(isSelected) => {
                    if (element.type === 'radio') {
                      updateElement({
                        options: element.options?.map((_option, _index) => ({
                          ..._option,
                          selected: isSelected && i === _index,
                        })),
                      });
                    } else {
                      updateOption(i, {
                        selected: isSelected,
                      });
                    }
                  }}
                >
                  vorausgewählt
                </Checkbox>
              </section>
            ))}
            <Button
              icon={<Icon icon={faCirclePlus} size={'lg'} />}
              onClick={() =>
                updateElement({
                  options: [
                    ...(element.options ?? []),
                    {
                      label: `Auswahl Nummer ${
                        (element.options?.length ?? 0) + 1
                      }`,
                      value: `a${(element.options?.length ?? 0) + 1}`,
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
  }
);
FormElementConfiguration.displayName = 'FormElementConfiguration';
