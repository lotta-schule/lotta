import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

import {
  Button,
  Checkbox,
  DragHandle,
  Divider,
  Input,
  Label,
} from '@lotta-schule/hubert';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ContentModuleModel } from 'model';
import { FormConfiguration } from './Form';
import { FormElement } from './FormElement';
import { FormElementConfiguration } from './FormElementConfiguration';

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
        <DragDropContext
          onDragEnd={({ destination, source }) => {
            if (!destination) {
              return;
            }

            if (
              destination.droppableId === source.droppableId &&
              destination.index === source.index
            ) {
              return;
            }

            const elements = [...configuration.elements];
            const sourceElement = elements[source.index];
            elements.splice(source.index, 1);
            elements.splice(destination.index, 0, sourceElement);
            updateConfiguration({ elements });
          }}
        >
          <Droppable droppableId={`form-${contentModule.id}`}>
            {(provided) => (
              <section {...provided.droppableProps} ref={provided.innerRef}>
                {configuration.elements.map((element: any, index) => (
                  <Draggable
                    key={index}
                    draggableId={String(index)}
                    index={index}
                  >
                    {(draggableProvided) => (
                      <div
                        className={styles.downloadItemWrapper}
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                      >
                        <div className={styles.downloadWrapperHeader}>
                          <span {...draggableProvided.dragHandleProps}>
                            <DragHandle className={styles.dragHandle} />
                          </span>
                          <Button
                            onClick={() =>
                              updateConfiguration({
                                elements: configuration.elements.filter(
                                  (_el, i) => i !== index
                                ),
                              })
                            }
                            icon={<Icon icon={faTrash} />}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <div>
                            <FormElement
                              element={element}
                              isEditModeEnabled
                              value={''}
                              onSetValue={() => {}}
                            />
                          </div>
                          <div>
                            <FormElementConfiguration
                              element={element}
                              updateElement={(updatedElementOptions) =>
                                updateConfiguration({
                                  elements: configuration.elements.map(
                                    (el, i) => {
                                      if (i === index) {
                                        return {
                                          ...element,
                                          ...updatedElementOptions,
                                        };
                                      }
                                      return el;
                                    }
                                  ),
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </section>
            )}
          </Droppable>
        </DragDropContext>
        <div className={styles.inputWrapper}>
          <div>
            <Button type={'submit'} disabled>
              Senden
            </Button>
          </div>
          <div>
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
            <Divider />
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
        <Button
          style={{ float: 'right' }}
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
        <p className={styles.clear}></p>
      </div>
    );
  }
);
Edit.displayName = 'FormEdit';
