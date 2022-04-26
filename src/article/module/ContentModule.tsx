import * as React from 'react';
import { Popover, Box } from '@material-ui/core';
import {
    MoreVert,
    Delete,
    ArrowUpward,
    ArrowDownward,
} from '@material-ui/icons';
import { DragHandle } from 'shared/general/icon';
import { ArticleModel, ContentModuleModel, ContentModuleType } from 'model';
import { Text } from './text/Text';
import { Title } from './title/Title';
import { Config as TitleConfig } from './title/Config';
import { Config as DownloadConfig } from './download/Config';
import { Image as ImageModule } from './image/Image';
import { ImageCollection } from './image_collection/ImageCollection';
import { Config as ImageCollectionConfig } from './image_collection/Config';
import { Video } from './video/Video';
import { Audio } from './audio/Audio';
import { Download } from './download/Download';
import { Form } from './form/Form';
import { Table } from './table/Table';
import { Divider as DividerCM } from './divider/Divider';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import {
    bindTrigger,
    bindPopover,
    usePopupState,
} from 'material-ui-popup-state/hooks';
import { Button } from 'shared/general/button/Button';
import { Divider } from 'shared/general/divider/Divider';
import clsx from 'clsx';

import styles from './ContentModule.module.scss';

interface ContentModuleProps {
    contentModule: ContentModuleModel;
    article: ArticleModel;
    index: number;
    isEditModeEnabled?: boolean;
    isDragging?: boolean;
    elementProps?: Omit<React.HTMLProps<HTMLElement>, 'className'>;
    dragbarProps?: Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
    onRemoveContentModule?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

export const ContentModule = React.memo<ContentModuleProps>(
    ({
        isEditModeEnabled,
        article,
        contentModule,
        isDragging,
        elementProps,
        dragbarProps,
        onUpdateModule,
        onRemoveContentModule,
        onMoveUp,
        onMoveDown,
    }) => {
        const popupState = usePopupState({
            variant: 'popover',
            popupId: 'contentmodule-configuration',
        });
        const user = useCurrentUser();

        const canEditArticle = User.canEditArticle(user, article);

        const config = React.useMemo(() => {
            if (!onUpdateModule) {
                return null;
            }
            switch (contentModule.type) {
                case ContentModuleType.TITLE:
                    return (
                        <TitleConfig
                            contentModule={contentModule}
                            onUpdateModule={onUpdateModule}
                            onRequestClose={popupState.close}
                        />
                    );
                case ContentModuleType.IMAGE_COLLECTION:
                    return (
                        <ImageCollectionConfig
                            contentModule={contentModule}
                            onUpdateModule={onUpdateModule}
                            onRequestClose={popupState.close}
                        />
                    );
                case ContentModuleType.DOWNLOAD:
                    return (
                        <DownloadConfig
                            contentModule={contentModule}
                            onUpdateModule={onUpdateModule}
                            onRequestClose={popupState.close}
                        />
                    );
            }
        }, [contentModule, onUpdateModule, popupState]);

        return (
            <section
                className={clsx(styles.root, {
                    [styles.active]: popupState.isOpen,
                    [styles.dragging]: isDragging,
                    [styles.isEditModeEnabled]: isEditModeEnabled,
                })}
                data-testid={'ContentModule'}
                {...elementProps}
            >
                {isEditModeEnabled && (
                    <div
                        {...dragbarProps}
                        className={styles.dragbar}
                        title={'Klicken und Ziehen zum verschieben'}
                    >
                        <section className={styles.leftButtonSection}>
                            <DragHandle />
                            {onMoveUp && (
                                <Button
                                    small
                                    aria-label={
                                        'Modul um eine Stelle nach oben bewegen'
                                    }
                                    className={styles.dragbarButton}
                                    icon={<ArrowUpward />}
                                    onClick={() => onMoveUp()}
                                />
                            )}
                            {onMoveDown && (
                                <Button
                                    small
                                    aria-label={
                                        'Modul um eine Stelle nach unten bewegen'
                                    }
                                    className={styles.dragbarButton}
                                    icon={<ArrowDownward />}
                                    onClick={() => onMoveDown()}
                                />
                            )}
                        </section>
                        <span>
                            <Button
                                small
                                className={styles.dragbarButton}
                                style={{
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                }}
                                aria-label="Einstellungen"
                                icon={
                                    <MoreVert
                                        className={clsx(styles.buttonIcon, {
                                            [styles.activeButtonIcon]:
                                                popupState.isOpen,
                                        })}
                                    />
                                }
                                {...bindTrigger(popupState)}
                            />
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
                                        variant={'error'}
                                        icon={
                                            <Delete
                                                className={clsx(
                                                    styles.buttonIcon
                                                )}
                                            />
                                        }
                                        aria-label={'Modul löschen'}
                                        style={{ float: 'right' }}
                                        onClick={() =>
                                            onRemoveContentModule?.()
                                        }
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
                    <Text
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.IMAGE && (
                    <ImageModule
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.IMAGE_COLLECTION && (
                    <ImageCollection
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.DIVIDER && (
                    <DividerCM
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.VIDEO && (
                    <Video
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.AUDIO && (
                    <Audio
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.DOWNLOAD && (
                    <Download
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
                {contentModule.type === ContentModuleType.FORM && (
                    <Form
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                        showResults={canEditArticle}
                    />
                )}
                {contentModule.type === ContentModuleType.TABLE && (
                    <Table
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={onUpdateModule}
                    />
                )}
            </section>
        );
    }
);
ContentModule.displayName = 'CM';
