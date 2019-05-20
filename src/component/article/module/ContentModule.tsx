import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel, ContentModuleType } from '../../../model';
import { Text } from './text/Text';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { Card, makeStyles, Theme, createStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dragbar: {
            height: '1em',
            backgroundColor: theme.palette.primary.main
        }
    }),
);

interface ContentModuleProps {
    module: ContentModuleModel;
    index: number;
    isEditModeEnabled?: boolean;
    onUpdateModule?(module: ContentModuleModel): void;
}

export const ContentModule: FunctionComponent<ContentModuleProps> = memo(({ isEditModeEnabled, module, index, onUpdateModule }) => {

    const styles = useStyles();

    const card = (draggableProvided?: DraggableProvided) => (
        <Card component={'section'} innerRef={draggableProvided && draggableProvided.innerRef} {...(draggableProvided ? draggableProvided.draggableProps : undefined)}>
            {isEditModeEnabled && (
                <div {...(draggableProvided ? draggableProvided.dragHandleProps : undefined)} className={styles.dragbar} />
            )}
            {module.type === ContentModuleType.Text && <Text module={module} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />}
        </Card>
    );

    return isEditModeEnabled ?
        (
            <Draggable draggableId={module.id} index={index}>
                {card}
            </Draggable>
        ) : (
            card()
        );
});