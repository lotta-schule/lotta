import React, { FunctionComponent, memo, useState, useCallback } from 'react';
import { ContentModuleModel, ContentModuleType } from '../../../model';
import { Text } from './text/Text';
import { Title } from './title/Title';
import { Config as TitleConfig } from './title/Config';
import { Image } from './image/Image';
import { Config as ImageConfig } from './image/Config';
import { Video } from './video/Video';
import { Audio } from './audio/Audio';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { Card, makeStyles, Theme, createStyles, IconButton, Collapse } from '@material-ui/core';
import { DragHandle, Delete, Settings } from '@material-ui/icons';
import { includes } from 'lodash';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            position: 'relative'
        },
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
        },
        buttonIcon: {
            color: '#888'
        },
        activeButtonIcon: {
            color: theme.palette.primary.main
        },
        configSection: {
            position: 'absolute',
            top: '2.25em',
            left: 0,
            width: '100%',
            zIndex: 1,
            backgroundColor: '#fff'
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
        <Card
            className={styles.card}
            component={'section'}
            innerRef={draggableProvided && draggableProvided.innerRef}
            {...(draggableProvided ? draggableProvided.draggableProps : undefined)}
        >
            {isEditModeEnabled && (
                <div {...(draggableProvided ? draggableProvided.dragHandleProps : undefined)} className={styles.dragbar}>
                    <span>
                        <DragHandle style={{ marginTop: '0.15em', marginLeft: '0.5em', color: '#888' }} />
                        {includes(configurableContentModuleTypes, contentModule.type) && (
                            <IconButton
                                classes={{ root: styles.dragbarButton }}
                                aria-label="Settings"
                                onClick={() => toggleConfigMode(contentModule.id)}
                            >
                                <Settings className={classNames(styles.buttonIcon, { [styles.activeButtonIcon]: showConfigModeContentModuleId === contentModule.id })} />
                            </IconButton>
                        )}
                    </span>
                    <span>
                        <IconButton color={'primary'} classes={{ root: styles.dragbarButton }} aria-label="Delete" style={{ float: 'right' }}>
                            <Delete className={classNames(styles.buttonIcon)} />
                        </IconButton>
                    </span>
                </div>
            )}
            {contentModule.type === ContentModuleType.TITLE && (
                <>
                    <Collapse in={showConfigModeContentModuleId === contentModule.id} className={styles.configSection}>
                        <TitleConfig
                            contentModule={contentModule}
                            onUpdateModule={onUpdateModule}
                            onRequestClose={() => setShowConfigModeContentModuleId(null)}
                        />
                    </Collapse>
                    <Title
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                </>
            )}
            {contentModule.type === ContentModuleType.TEXT && (
                <Text contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
            )}
            {contentModule.type === ContentModuleType.IMAGE && (
                <>
                    <Collapse in={showConfigModeContentModuleId === contentModule.id} className={styles.configSection}>
                        <ImageConfig
                            contentModule={contentModule}
                            onUpdateModule={onUpdateModule}
                            onRequestClose={() => setShowConfigModeContentModuleId(null)}
                        />
                    </Collapse>
                    <Image
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                </>
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