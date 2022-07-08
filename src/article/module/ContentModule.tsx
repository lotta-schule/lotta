import * as React from 'react';
import {
    MoreVert,
    Delete,
    ArrowUpward,
    ArrowDownward,
} from '@material-ui/icons';
import { Button, DragHandle, Divider, Popover } from '@lotta-schule/hubert';
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
                            onRequestClose={() => {
                                /* TODO: ?!?! */
                            }}
                        />
                    );
                case ContentModuleType.IMAGE_COLLECTION:
                    return (
                        <ImageCollectionConfig
                            contentModule={contentModule}
                            onUpdateModule={onUpdateModule}
                            onRequestClose={() => {
                                /* TODO: ?!?! */
                            }}
                        />
                    );
                case ContentModuleType.DOWNLOAD:
                    return (
                        <DownloadConfig
                            contentModule={contentModule}
                            onUpdateModule={onUpdateModule}
                            onRequestClose={() => {
                                /* TODO: ?!?! */
                            }}
                        />
                    );
            }
        }, [contentModule, onUpdateModule]);

        return (
            <section
                className={clsx(styles.root, {
                    [styles.active]: false /* TODO: popupState.isOpen, */,
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
                            <Popover
                                aria-label={'Einstellungen'}
                                buttonProps={{
                                    small: true,
                                    className: styles.dragbarButton,
                                    style: {},
                                    'aria-label': 'Einstellungen',
                                    icon: (
                                        <MoreVert
                                            className={clsx(styles.buttonIcon, {
                                                [styles.activeButtonIcon]:
                                                    false /* TODO: popupState.isOpen, */,
                                            })}
                                        />
                                    ),
                                }}
                            >
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
                                            className={clsx(styles.buttonIcon)}
                                        />
                                    }
                                    aria-label={'Modul löschen'}
                                    style={{ float: 'right' }}
                                    onClick={() => onRemoveContentModule?.()}
                                >
                                    Modul löschen
                                </Button>
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
