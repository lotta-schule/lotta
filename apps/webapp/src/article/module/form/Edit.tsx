import * as React from 'react';
import { Icon } from '#/shared/Icon.js';
import {
  faArrowsUpDown,
  faCircleExclamation,
  faPlus,
  faTrash,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import {
  AttachFile as AttachFileIcon,
  Button,
  Checkbox,
  CheckboxIcon,
  Checklist as ChecklistIcon,
  Input,
  Item,
  Label,
  Mail as MailIcon,
  MenuButton,
  RadioButton as RadioButtonIcon,
  SortableDraggableList,
  TextFormat as TextFormatIcon,
  TextLines as TextLinesIcon,
} from '@lotta-schule/hubert';
import { ContentModuleModel } from '#/model/index.js';
import {
  FormConfiguration,
  FormElement as FormElementInterface,
} from './Form.js';
import { FormElement } from './FormElement.js';

import styles from './Edit.module.scss';

export type EditProps = {
  contentModule: ContentModuleModel;
  onUpdateModule(contentModule: ContentModuleModel): void;
};

export const Edit = React.memo(
  ({ contentModule, onUpdateModule }: EditProps) => {
    const { t } = useTranslation();
    const defaultElements = {
      input: {
        name: 'Textfeld',
        element: 'input',
        type: 'text',
      } as FormElementInterface,
      email: {
        name: 'Textfeld',
        element: 'input',
        type: 'email',
      } as FormElementInterface,
      date: {
        name: 'Textfeld',
        element: 'input',
        type: 'date',
      } as FormElementInterface,
      textarea: {
        name: 'Textbereich',
        element: 'input',
        multiline: true,
      } as FormElementInterface,
      checkbox: {
        name: 'Checkbox',
        element: 'selection',
        type: 'checkbox',
        options: [
          { label: 'Option 1', value: 'option1', selected: false },
          { label: 'Option 2', value: 'option2', selected: false },
        ],
      } as FormElementInterface,
      radio: {
        name: 'Auswahl',
        element: 'selection',
        type: 'radio',
        options: [
          { label: 'Option 1', value: 'option1', selected: false },
          { label: 'Option 2', value: 'option2', selected: false },
        ],
      } as FormElementInterface,
      select: {
        name: 'Dropdown',
        element: 'selection',
        type: 'select',
        options: [
          { label: 'Option 1', value: 'option1', selected: false },
          { label: 'Option 2', value: 'option2', selected: false },
        ],
      } as FormElementInterface,
      file: {
        name: 'Datei-Upload',
        element: 'file',
        type: '',
      } as FormElementInterface,
    };

    const configuration: FormConfiguration = {
      destination: '',
      elements: [],
      ...contentModule.configuration,
    };
    const updateConfiguration = (partialConfig: Partial<FormConfiguration>) =>
      onUpdateModule({
        ...contentModule,
        configuration: { ...configuration, ...partialConfig },
      });

    return (
      <div className={styles.root}>
        <SortableDraggableList
          id={`from-${contentModule.id}`}
          onChange={(updatedItems) => {
            const elements = updatedItems.map(
              (item) => configuration.elements[Number(item.id)]
            );
            updateConfiguration({ elements });
          }}
          items={configuration.elements.map((element, index) => ({
            id: String(index),
            title: element.name,
            icon: <Icon icon={faTrash} />,
            onClickIcon: () => {
              updateConfiguration({
                elements: configuration.elements.filter(
                  (_el, i) => i !== index
                ),
              });
            },
            children: (
              <div className={styles.inputWrapper}>
                <div className={styles.iconWrapper}>
                  {' '}
                  <Icon icon={faArrowsUpDown} size={'lg'} />
                </div>
                <div>
                  <FormElement
                    element={element}
                    isEditModeEnabled
                    value={''}
                    onSetValue={() => {}}
                  />
                </div>
                <div className={styles.iconWrapper}>
                  <Button
                    title={element.required ? t('not required') : t('required')}
                    aria-checked={element.required}
                    role={'checkbox'}
                    icon={
                      <Icon
                        icon={faCircleExclamation}
                        size={'lg'}
                        color={element.required ? 'secondary' : 'primary'}
                      />
                    }
                    onClick={() =>
                      updateConfiguration({
                        elements: configuration.elements.map((el, i) => {
                          if (i === index) {
                            return {
                              ...element,
                              required: !element.required,
                            };
                          }
                          return el;
                        }),
                      })
                    }
                  />
                  <Button
                    type={'submit'}
                    title={t('delete field')}
                    icon={<Icon icon={faTrash} size={'lg'} />}
                    onClick={() =>
                      updateConfiguration({
                        elements: configuration.elements.filter(
                          (_el, i) => i !== index
                        ),
                      })
                    }
                  />
                  {/*<FormElementConfiguration
                    element={element}
                    updateElement={(updatedElementOptions) =>
                      updateConfiguration({
                        elements: configuration.elements.map((el, i) => {
                          if (i === index) {
                            return {
                              ...element,
                              ...updatedElementOptions,
                            };
                          }
                          return el;
                        }),
                      })
                    }
                  />*/}
                </div>
              </div>
            ),
          }))}
        />
        <MenuButton
          title="Feld hinzufügen"
          buttonProps={{
            label: 'Feld hinzufügen',
            style: { margin: '0 auto' },
            variant: 'fill',
            icon: <Icon icon={faPlus} size={'lg'} />,
          }}
          onAction={(key) => {
            const newElement =
              defaultElements[key as keyof typeof defaultElements];
            if (!newElement) {
              return;
            }
            updateConfiguration({
              elements: [
                ...configuration.elements,
                Object.assign({}, newElement, {
                  name: `feld${configuration.elements.length + 1}`,
                }),
              ],
            });
          }}
        >
          <Item key={'email'} textValue="E-Mail-Adresse">
            <div>
              <MailIcon />
            </div>
            <span>E-Mail-Adresse</span>
          </Item>
          <Item key={'input'} textValue="Textzeile">
            <div>
              <TextFormatIcon />
            </div>
            <span>Textzeile</span>
          </Item>
          <Item key={'textarea'} textValue="Textbereich">
            <div>
              <TextLinesIcon />
            </div>
            <span>Textbereich</span>
          </Item>
          <Item key={'date'} title="Datum">
            <div></div>
            <span>Datum</span>
          </Item>
          <Item key={'checkbox'} textValue="Checkbox">
            <div>
              <CheckboxIcon />
            </div>
            <span>Checkbox</span>
          </Item>
          <Item key={'radio'} textValue="Auswahl">
            <div>
              <RadioButtonIcon />
            </div>
            <span>Auswahl</span>
          </Item>
          <Item key={'select'} textValue="Dropdown">
            <div>
              <ChecklistIcon />
            </div>
            <span>Dropdown</span>
          </Item>
          <Item key={'file'} textValue="Datei-Upload">
            <div>
              <AttachFileIcon />
            </div>
            <span>Datei-Upload</span>
          </Item>
        </MenuButton>
        <div className={styles.settingsWrapper}>
          <div>
            <Icon icon={faGear} size={'xl'} />
          </div>
          <div>
            <h3>Formular Einstellungen</h3>
            <Checkbox
              isSelected={configuration.destination !== undefined}
              onChange={(isSelected) =>
                updateConfiguration({
                  destination: isSelected ? '' : undefined,
                })
              }
            >
              Formulardaten per Email versenden
            </Checkbox>
            <Label label={'Formular an folgende Email senden:'}>
              <Input
                id={'form-destination'}
                value={configuration.destination ?? ''}
                disabled={configuration.destination === undefined}
                onChange={(e) =>
                  updateConfiguration({
                    destination: e.currentTarget.value,
                  })
                }
              />
            </Label>
            <Checkbox
              isSelected={configuration.save_internally === true}
              onChange={(isSelected) =>
                updateConfiguration({
                  save_internally: isSelected,
                })
              }
              aria-label={'Formulardaten speichern'}
            >
              <div>
                <span style={{ display: 'block' }}>
                  Formulardaten speichern
                </span>
                {!!configuration.elements.find(
                  (el) => el.element === 'file'
                ) && (
                  <small>
                    Datei-Anhänge werden nur per Email versandt und nicht
                    gespeichert.
                  </small>
                )}
              </div>
            </Checkbox>
          </div>
        </div>
        <p className={styles.clear}></p>
      </div>
    );
  }
);
Edit.displayName = 'FormEdit';
