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
    const defaultElements: {
      key: string;
      label: string;
      icon: React.ReactNode;
      element: FormElementInterface;
    }[] = [
      {
        key: 'email',
        label: t('email address'),
        icon: <MailIcon />,
        element: { name: 'Textfeld', element: 'input', type: 'email' },
      },
      {
        key: 'input',
        label: t('text field'),
        icon: <TextFormatIcon />,
        element: { name: 'Textfeld', element: 'input', type: 'text' },
      },
      {
        key: 'textarea',
        label: t('text area'),
        icon: <TextLinesIcon />,
        element: { name: 'Textbereich', element: 'input', multiline: true },
      },
      {
        key: 'date',
        label: t('date field'),
        icon: null,
        element: { name: 'Textfeld', element: 'input', type: 'date' },
      },
      {
        key: 'checkbox',
        label: t('checkbox'),
        icon: <CheckboxIcon />,
        element: {
          name: 'Checkbox',
          element: 'selection',
          type: 'checkbox',
          options: [
            { label: 'Option 1', value: 'option1', selected: false },
            { label: 'Option 2', value: 'option2', selected: false },
          ],
        },
      },
      {
        key: 'radio',
        label: t('radio buttons'),
        icon: <RadioButtonIcon />,
        element: {
          name: 'Auswahl',
          element: 'selection',
          type: 'radio',
          options: [
            { label: 'Option 1', value: 'option1', selected: false },
            { label: 'Option 2', value: 'option2', selected: false },
          ],
        },
      },
      {
        key: 'select',
        label: t('dropdown'),
        icon: <ChecklistIcon />,
        element: {
          name: 'Dropdown',
          element: 'selection',
          type: 'select',
          options: [
            { label: 'Option 1', value: 'option1', selected: false },
            { label: 'Option 2', value: 'option2', selected: false },
          ],
        },
      },
      {
        key: 'file',
        label: t('file upload'),
        icon: <AttachFileIcon />,
        element: { name: 'Datei-Upload', element: 'file', type: '' },
      },
    ];

    const getElementIcon = (element: FormElementInterface) =>
      defaultElements.find(
        ({ element: defaultElement }) =>
          defaultElement.element === element.element &&
          defaultElement.type === element.type &&
          !!defaultElement.multiline === !!element.multiline
      )?.icon ?? <Icon icon={faArrowsUpDown} size={'lg'} />;

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
        {configuration.elements.length > 0 && (
          <div className={styles.listHeader}>
            <span>{t('required?')}</span>
          </div>
        )}
        <SortableDraggableList
          id={`from-${contentModule.id}`}
          onChange={(updatedItems) => {
            const elements = updatedItems
              .map((item) =>
                configuration.elements.at(
                  parseInt(item.id.replace('field-', ''))
                )
              )
              .filter((element) => element !== undefined);
            updateConfiguration({ elements });
          }}
          items={configuration.elements.map((element, index) => ({
            id: `field-${index}`,
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
                  {getElementIcon(element)}
                </div>
                <div>
                  <FormElement
                    element={element}
                    isEditModeEnabled
                    value={''}
                    onSetValue={() => {}}
                    onUpdateElement={(updatedElement) =>
                      updateConfiguration({
                        elements: configuration.elements.map((el, i) =>
                          i === index ? { ...el, ...updatedElement } : el
                        ),
                      })
                    }
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
                </div>
              </div>
            ),
          }))}
        />
        <MenuButton
          title={t('add field')}
          buttonProps={{
            label: t('add field'),
            style: { margin: '0 auto' },
            variant: 'fill',
            icon: <Icon icon={faPlus} size={'lg'} />,
          }}
          onAction={(key) => {
            const newElement = defaultElements.find(
              (el) => el.key === key
            )?.element;
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
          {defaultElements.map(({ key, label, icon }) => (
            <Item key={key} textValue={label}>
              <div>{icon}</div>
              <span>{label}</span>
            </Item>
          ))}
        </MenuButton>
        <div className={styles.settingsWrapper}>
          <div>
            <Icon icon={faGear} size={'xl'} />
          </div>
          <div>
            <h3>{t('Form settings')}</h3>
            <Checkbox
              isSelected={configuration.destination !== undefined}
              onChange={(isSelected) =>
                updateConfiguration({
                  destination: isSelected ? '' : undefined,
                })
              }
            >
              {t('send form data by email')}
            </Checkbox>
            <Label label={t('Send form to the following mail address:')}>
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
              aria-label={t('save form data')}
            >
              <div>
                <span style={{ display: 'block' }}>{t('save form data')}</span>
                {!!configuration.elements.find(
                  (el) => el.element === 'file'
                ) && (
                  <small>
                    {t(
                      'file attachments are only sent by email and not stored'
                    )}
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
