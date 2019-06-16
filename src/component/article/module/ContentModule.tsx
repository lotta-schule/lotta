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
    contentModule: ContentModuleModel;
    index: number;
    isEditModeEnabled?: boolean;
    onUpdateModule?(contentModule: ContentModuleModel): void;
}

export const ContentModule: FunctionComponent<ContentModuleProps> = memo(({ isEditModeEnabled, contentModule, index, onUpdateModule }) => {

    const styles = useStyles();

    const card = (draggableProvided?: DraggableProvided) => (
        <Card component={'section'} innerRef={draggableProvided && draggableProvided.innerRef} {...(draggableProvided ? draggableProvided.draggableProps : undefined)}>
            {isEditModeEnabled && (
                <div {...(draggableProvided ? draggableProvided.dragHandleProps : undefined)} className={styles.dragbar} />
            )}
            {contentModule.type === ContentModuleType.TEXT && <Text contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />}
        </Card>
    );

    return isEditModeEnabled ?
        (
            <Draggable draggableId={contentModule.id} index={index}>
                {card}
            </Draggable>
        ) : (
            card()
        );
});