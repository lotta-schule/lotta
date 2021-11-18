import * as React from 'react';
import { Add, DragHandle, Delete } from '@material-ui/icons';
import { Grid } from '@material-ui/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from 'shared/general/button/Button';
import { Checkbox } from 'shared/general/form/checkbox';
import { Divider } from 'shared/general/divider/Divider';
import { Input } from 'shared/general/form/input/Input';
import { Label } from 'shared/general/label/Label';
import { ContentModuleModel } from 'model';
import { FormConfiguration } from './Form';
import { FormElement } from './FormElement';
import { FormElementConfiguration } from './FormElementConfiguration';

import styles from './Edit.module.scss';

export interface EditProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Edit = React.memo<EditProps>(
    ({ contentModule, onUpdateModule }) => {
        const configuration: FormConfiguration = {
            destination: '',
            elements: [],
            ...contentModule.configuration,
        };
        const updateConfiguration = (
            partialConfig: Partial<FormConfiguration>
        ) =>
            onUpdateModule({
                ...contentModule,
                configuration: { ...configuration, ...partialConfig },
            });

        return (
            <>
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
                            <section
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {configuration.elements.map(
                                    (element: any, index) => (
                                        <Draggable
                                            key={index}
                                            draggableId={String(index)}
                                            index={index}
                                        >
                                            {(draggableProvided) => (
                                                <div
                                                    className={
                                                        styles.downloadItemWrapper
                                                    }
                                                    ref={
                                                        draggableProvided.innerRef
                                                    }
                                                    {...draggableProvided.draggableProps}
                                                >
                                                    <div
                                                        className={
                                                            styles.downloadWrapperHeader
                                                        }
                                                    >
                                                        <span
                                                            {...draggableProvided.dragHandleProps}
                                                        >
                                                            <DragHandle />
                                                        </span>
                                                        <Button
                                                            onClick={() =>
                                                                updateConfiguration(
                                                                    {
                                                                        elements:
                                                                            configuration.elements.filter(
                                                                                (
                                                                                    _el,
                                                                                    i
                                                                                ) =>
                                                                                    i !==
                                                                                    index
                                                                            ),
                                                                    }
                                                                )
                                                            }
                                                            icon={<Delete />}
                                                        />
                                                    </div>
                                                    <Grid
                                                        container
                                                        className={
                                                            styles.inputWrapper
                                                        }
                                                    >
                                                        <Grid item xs={5}>
                                                            <FormElement
                                                                element={
                                                                    element
                                                                }
                                                                isEditModeEnabled
                                                                value={''}
                                                                onSetValue={() => {}}
                                                            />
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            xs={7}
                                                            className={
                                                                styles.inputSettings
                                                            }
                                                        >
                                                            <FormElementConfiguration
                                                                element={
                                                                    element
                                                                }
                                                                updateElement={(
                                                                    updatedElementOptions
                                                                ) =>
                                                                    updateConfiguration(
                                                                        {
                                                                            elements:
                                                                                configuration.elements.map(
                                                                                    (
                                                                                        el,
                                                                                        i
                                                                                    ) => {
                                                                                        if (
                                                                                            i ===
                                                                                            index
                                                                                        ) {
                                                                                            return {
                                                                                                ...element,
                                                                                                ...updatedElementOptions,
                                                                                            };
                                                                                        }
                                                                                        return el;
                                                                                    }
                                                                                ),
                                                                        }
                                                                    )
                                                                }
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            )}
                                        </Draggable>
                                    )
                                )}
                                {provided.placeholder}
                            </section>
                        )}
                    </Droppable>
                </DragDropContext>
                <Grid container className={styles.inputWrapper}>
                    <Grid item xs={5}>
                        <Button type={'submit'} disabled>
                            Senden
                        </Button>
                    </Grid>
                    <Grid item xs={7}>
                        <Checkbox
                            checked={configuration.destination !== undefined}
                            onChange={(e) =>
                                updateConfiguration({
                                    destination: e.currentTarget.checked
                                        ? ''
                                        : undefined,
                                })
                            }
                            label={'Formulardaten per Email versenden'}
                        />
                        <Label label={'Formular an folgende Email senden:'}>
                            <Input
                                id={'form-destination'}
                                value={configuration.destination ?? ''}
                                disabled={
                                    configuration.destination === undefined
                                }
                                onChange={(e) =>
                                    updateConfiguration({
                                        destination: e.currentTarget.value,
                                    })
                                }
                            />
                        </Label>
                        <Divider />
                        <Checkbox
                            checked={configuration.save_internally === true}
                            onChange={(e) =>
                                updateConfiguration({
                                    save_internally: e.currentTarget.checked,
                                })
                            }
                            label={
                                <div>
                                    <span style={{ display: 'block' }}>
                                        Formulardaten speichern
                                    </span>
                                    {!!configuration.elements.find(
                                        (el) => el.element === 'file'
                                    ) && (
                                        <small>
                                            Datei-Anhänge werden nur per Email
                                            versandt und nicht gespeichert.
                                        </small>
                                    )}
                                </div>
                            }
                            aria-label={'Formulardaten speichern'}
                        />
                    </Grid>
                </Grid>
                <Button
                    style={{ float: 'right' }}
                    icon={<Add />}
                    onClick={() =>
                        updateConfiguration({
                            elements: [
                                ...configuration.elements,
                                {
                                    name: `feld${
                                        configuration.elements.length + 1
                                    }`,
                                    element: 'input',
                                    type: 'text',
                                },
                            ],
                        })
                    }
                >
                    Feld hinzufügen
                </Button>
                <p style={{ clear: 'right' }}></p>
            </>
        );
    }
);
Edit.displayName = 'FormEdit';
