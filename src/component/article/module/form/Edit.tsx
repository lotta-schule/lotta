import React, { memo } from 'react';
import { Add, DragHandle, Delete } from '@material-ui/icons';
import { IconButton, Button, Grid, TextField, makeStyles } from '@material-ui/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ContentModuleModel } from 'model';
import { FormConfiguration } from './Form';
import { FormElement } from './FormElement';
import { FormElementConfiguration } from './FormElementConfiguration';

export interface EditProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const useStyles = makeStyles(theme => ({
    downloadItemWrapper: {
        marginBottom: theme.spacing(2)
    },
    downloadWrapperHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    },
    inputWrapper: {
        '& > div': {
            padding: theme.spacing(1)
        }
    },
    inputSettings: {
        borderLeftColor: theme.palette.grey[200],
        borderLeftWidth: theme.spacing(1),
        borderLeftStyle: 'solid',
        borderRadius: theme.spacing(1)
    }
}));

export const Edit = memo<EditProps>(({ contentModule, onUpdateModule }) => {
    const styles = useStyles();

    console.log(contentModule);
    console.log(contentModule.configuration);
    const configuration: FormConfiguration = { destination: '', elements: [], ...contentModule.configuration };
    console.log(configuration);
    const updateConfiguration = (partialConfig: Partial<FormConfiguration>) =>
        onUpdateModule({ ...contentModule, configuration: { ...configuration, ...partialConfig } });

    return (
        <>
            <DragDropContext onDragEnd={({ destination, source }) => {
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
            }}>
                <Droppable droppableId={`form-${contentModule.id}`}>
                    {provided => (
                        <section {...provided.droppableProps} ref={provided.innerRef}>
                            {configuration.elements.map((element: any, index) => (
                                <Draggable key={index} draggableId={String(index)} index={index}>{draggableProvided => (
                                    <div
                                        className={styles.downloadItemWrapper}
                                        ref={draggableProvided.innerRef}
                                        {...draggableProvided.draggableProps}
                                    >
                                        <div className={styles.downloadWrapperHeader}>
                                            <span {...draggableProvided.dragHandleProps}>
                                                <DragHandle />
                                            </span>
                                            <IconButton onClick={() =>
                                                updateConfiguration({ elements: configuration.elements.filter((_el, i) => i !== index) })
                                            }>
                                                <Delete />
                                            </IconButton>
                                        </div>
                                        <Grid container className={styles.inputWrapper}>
                                            <Grid item xs={5}>
                                                <FormElement
                                                    element={element}
                                                    isEditModeEnabled
                                                />
                                            </Grid>
                                            <Grid item xs={7} className={styles.inputSettings}>
                                                <FormElementConfiguration
                                                    element={element}
                                                    updateElement={updatedElementOptions => updateConfiguration({
                                                        elements: configuration.elements.map((el, i) => {
                                                            if (i === index) {
                                                                return {
                                                                    ...element,
                                                                    ...updatedElementOptions
                                                                };
                                                            }
                                                            return el;
                                                        })
                                                    })}
                                                />
                                            </Grid>
                                        </Grid>
                                    </div>
                                )}</Draggable>
                            ))}
                            {provided.placeholder}
                        </section>
                    )}
                </Droppable>
            </DragDropContext>
            <Grid container className={styles.inputWrapper}>
                <Grid item xs={8}>
                    <Button color={'primary'} type={'submit'} disabled>Senden</Button>
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        id={'form-destination'}
                        label={'Formular an folgende Email senden'}
                        value={configuration.destination}
                        onChange={e => updateConfiguration({ destination: e.target.value })}
                    />
                </Grid>
            </Grid>
            <Button
                style={{ float: 'right' }}
                startIcon={<Add />}
                onClick={() => updateConfiguration({
                    elements: [...configuration.elements, { name: `feld${configuration.elements.length}`, element: 'input', type: 'text' }]
                })}
            >
                Feld hinzufügen
            </Button>
        </>
    );
});