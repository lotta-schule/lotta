import React, { memo, useMemo, HTMLAttributes, Suspense } from 'react';
import { Card, makeStyles, Theme, createStyles, IconButton, Popover, Box, Divider, Button, CardProps, StyledComponentProps, CircularProgress } from '@material-ui/core';
import { MoreVert, Delete, DragHandle } from '@material-ui/icons';
import { ContentModuleModel, ContentModuleType } from '../../../model';
import { Text } from './text/Text';
import { Title } from './title/Title';
import { Config as TitleConfig } from './title/Config';
import { Config as FormConfig } from './form/Config';
import { Config as DownloadConfig } from './download/Config';
import { Image } from './image/Image';
import { ImageCollection } from './image_collection/ImageCollection';
import { Config as ImageCollectionConfig } from './image_collection/Config';
import { Video } from './video/Video';
import { Audio } from './audio/Audio';
import { Download } from './download/Download';
import { Form } from './form/Form';
import { Table } from './table/Table';
import { bindTrigger, bindPopover, usePopupState } from 'material-ui-popup-state/hooks';
import clsx from 'clsx';

const useStyles = makeStyles<Theme, { isEditModeEnabled: boolean }>(theme =>
    createStyles({
        card: {
            position: 'relative',
            borderWidth: ({ isEditModeEnabled }) => isEditModeEnabled ? 1 : 0,
            borderColor: 'transparent',
            borderStyle: 'solid',
            overflow: 'initial',
            '&.dragging': {
                borderColor: theme.palette.secondary.main,
                '& $dragbar': {
                    backgroundColor: theme.palette.secondary.main,
                    opacity: 1
                }
            },
            '&:hover, &:focus-within, &.active': {
                borderColor: theme.palette.grey[200],
                '& $dragbar': {
                    opacity: .8
                }
            }
        },
        dragbar: {
            opacity: 0,
            height: '2em',
            width: '100%',
            backgroundColor: theme.palette.grey[200],
            display: 'flex',
            justifyContent: 'space-between',
            transition: 'opacity 250ms ease-in',
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
            color: theme.palette.grey[700]
        },
        activeButtonIcon: {
            color: theme.palette.primary.main
        },
        configSection: {
            position: 'absolute',
            top: '2.25em',
            left: 0,
            width: '100%',
            zIndex: 100,
            backgroundColor: theme.palette.background.paper
        }
    }),
);

interface ContentModuleProps {
    contentModule: ContentModuleModel;
    index: number;
    isEditModeEnabled?: boolean;
    isDragging?: boolean;
    cardProps?: Omit<CardProps, 'className' | 'component' | 'innerRef'> & Pick<StyledComponentProps, 'innerRef'>;
    dragbarProps?: Omit<HTMLAttributes<HTMLDivElement>, 'className'>;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRemoveContentModule(): void;
}

export const ContentModule = memo<ContentModuleProps>(({ isEditModeEnabled, contentModule, isDragging, cardProps, dragbarProps, onUpdateModule, onRemoveContentModule }) => {

    const styles = useStyles({ isEditModeEnabled: isEditModeEnabled ?? false });

    const popupState = usePopupState({ variant: 'popover', popupId: 'contentmodule-configuration' })

    const config = useMemo(() => {
        switch (contentModule.type) {
            case ContentModuleType.TITLE:
                return <TitleConfig
                    contentModule={contentModule}
                    onUpdateModule={onUpdateModule}
                    onRequestClose={popupState.close}
                />;
            case ContentModuleType.IMAGE_COLLECTION:
                return <ImageCollectionConfig
                    contentModule={contentModule}
                    onUpdateModule={onUpdateModule}
                    onRequestClose={popupState.close}
                />;
            case ContentModuleType.FORM:
                return <FormConfig
                    contentModule={contentModule}
                    onUpdateModule={onUpdateModule}
                    onRequestClose={popupState.close}
                />;
            case ContentModuleType.DOWNLOAD:
                return <DownloadConfig
                    contentModule={contentModule}
                    onUpdateModule={onUpdateModule}
                    onRequestClose={popupState.close}
                />;
        }
    }, [contentModule, onUpdateModule, popupState]);

    return (
        <Card
            className={clsx(styles.card, { active: popupState.isOpen, dragging: isDragging })}
            component={'section'}
            data-testid={'ContentModule'}
            {...cardProps}
        >
            <Suspense fallback={<CircularProgress />}>
                {isEditModeEnabled && (
                    <div {...dragbarProps} className={styles.dragbar} title={'Klicken und Ziehen zum verschieben'}>
                        <DragHandle />
                        <span>
                            <IconButton
                                classes={{ root: styles.dragbarButton }}
                                style={{ position: 'absolute', top: 0, right: 0 }}
                                aria-label="Einstellungen"
                                {...bindTrigger(popupState)}
                            >
                                <MoreVert className={clsx(styles.buttonIcon, { [styles.activeButtonIcon]: popupState.isOpen })} />
                            </IconButton>
                            <Popover
                                {...bindPopover(popupState)}
                                aria-label={'Einstellungen'}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <Box py={1} px={2} style={{ overflow: 'auto' }}>
                                    {config && (
                                        <>
                                            {config}
                                            <Divider />
                                        </>
                                    )}
                                    <Button
                                        color={'primary'}
                                        startIcon={<Delete className={clsx(styles.buttonIcon)} />}
                                        aria-label={'Modul löschen'}
                                        style={{ float: 'right' }}
                                        onClick={() => onRemoveContentModule()}
                                    >
                                        Modul löschen
                                </Button>
                                </Box>
                            </Popover>
                        </span>
                    </div>
                )}
                {contentModule.type === ContentModuleType.TITLE && (
                    <Title
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.TEXT && (
                    <Text contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
                )}
                {contentModule.type === ContentModuleType.IMAGE && (
                    <Image contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
                )}
                {contentModule.type === ContentModuleType.IMAGE_COLLECTION && (
                    <ImageCollection
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.VIDEO && (
                    <Video contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
                )}
                {contentModule.type === ContentModuleType.AUDIO && (
                    <Audio contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
                )}
                {contentModule.type === ContentModuleType.DOWNLOAD && (
                    <Download contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
                )}
                {contentModule.type === ContentModuleType.FORM && (
                    <Form contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
                )}
                {contentModule.type === ContentModuleType.TABLE && (
                    <Table contentModule={contentModule} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
                )}
            </Suspense>
        </Card>
    );
});
