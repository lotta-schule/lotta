import React, { FunctionComponent, memo, useState, useCallback } from 'react';
import { ContentModuleModel, ContentModuleType } from '../../../model';
import { Text } from './text/Text';
import { Title } from './title/Title';
import { Image } from './image/Image';
import { Video } from './video/Video';
import { Audio } from './audio/Audio';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { Card, makeStyles, Theme, createStyles, IconButton } from '@material-ui/core';
import { DragHandle, Delete, Settings } from '@material-ui/icons';
import { includes } from 'lodash';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dragbar: {
            height: '2em',
            backgroundColor: '#efefef',
            display: 'flex',
            justifyContent: 'space-between',
            '& > span': {
                display: 'flex'
            }
        },
        dragbarButton: {
            padding: '0 5px',
            height: 32,
            width: 32
        }
    }),
);

interface ContentModuleProps {
    contentModule: ContentModuleModel;
    index: number;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const ContentModule: FunctionComponent<ContentModuleProps> = memo(({ isEditModeEnabled, contentModule, index, onUpdateModule }) => {

    const styles = useStyles();
    const [showConfigModeContentModuleId, setShowConfigModeContentModuleId] = useState<string | null>(null);
    const toggleConfigMode = useCallback((id: string) => {
        if (showConfigModeContentModuleId === id) {
            setShowConfigModeContentModuleId(null);
        } else {
            setShowConfigModeContentModuleId(id);
        }
    }, [showConfigModeContentModuleId]);
    const configurableContentModuleTypes = [ContentModuleType.TITLE, ContentModuleType.IMAGE];

    const card = (draggableProvided?: DraggableProvided) => (
        <Card component={'section'} innerRef={draggableProvided && draggableProvided.innerRef} {...(draggableProvided ? draggableProvided.draggableProps : undefined)}>
            {isEditModeEnabled && (
                <div {...(draggableProvided ? draggableProvided.dragHandleProps : undefined)} className={styles.dragbar}>
                    <span>
                        <DragHandle style={{ marginTop: '0.15em', marginLeft: '0.5em', color: '#888' }} />
                        {includes(configurableContentModuleTypes, contentModule.type) && (
                            <IconButton classes={{ root: styles.dragbarButton }} aria-label="Settings" onClick={() => toggleConfigMode(contentModule.id)}>
                                <Settings style={{ color: '#888' }} />
                            </IconButton>
                        )}
                    </span>
                    <span>
                        <IconButton classes={{ root: styles.dragbarButton }} aria-label="Delete" style={{ float: 'right' }}>
                            <Delete style={{ color: '#888' }} />
                        </IconButton>
                    </span>
                </div>
            )}
            {contentModule.type === ContentModuleType.TITLE && (
                <Title contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} showConfig={showConfigModeContentModuleId === contentModule.id} />
            )}
            {contentModule.type === ContentModuleType.TEXT && (
                <Text contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
            )}
            {contentModule.type === ContentModuleType.IMAGE && (
                <Image contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} showConfig={showConfigModeContentModuleId === contentModule.id} />
            )}
            {contentModule.type === ContentModuleType.VIDEO && (
                <Video contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
            )}
            {contentModule.type === ContentModuleType.AUDIO && (
                <Audio contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
            )}
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