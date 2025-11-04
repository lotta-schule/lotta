import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faArrowsUpDown,
  faCircleExclamation,
  faPlus,
  faTrash,
  faGear,
} from '@fortawesome/free-solid-svg-icons';

import {
  Button,
  Checkbox,
  Input,
  Label,
  SortableDraggableList,
} from '@lotta-schule/hubert';
import { ContentModuleModel } from 'model';
import { FormConfiguration } from './Form';
import { FormElement } from './FormElement';

import styles from './Edit.module.scss';

export interface EditProps {
  contentModule: ContentModuleModel;
  onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Edit = React.memo(
  ({ contentModule, onUpdateModule }: EditProps) => {
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
                  <div>
                    <Icon icon={faCircleExclamation} size={'lg'} />{' '}
                    <Icon icon={faTrash} size={'lg'} />
                  </div>
                  {/* <FormElementConfiguration
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
                  /> */}
                </div>
              </div>
            ),
          }))}
        />
        <Button
          style={{ margin: '0 auto' }}
          variant={'fill'}
          icon={<Icon icon={faPlus} size={'lg'} />}
          onClick={() =>
            updateConfiguration({
              elements: [
                ...configuration.elements,
                {
                  name: `feld${configuration.elements.length + 1}`,
                  element: 'input',
                  type: 'text',
                },
              ],
            })
          }
        >
          Feld hinzufügen
        </Button>
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
