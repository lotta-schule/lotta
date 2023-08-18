import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
    faTrash,
    faGear,
    faArrowUp,
    faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import {
    Button,
    DragHandle,
    Dialog,
    DialogActions,
    DialogContent,
} from '@lotta-schule/hubert';
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
        const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

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
                            onRequestClose={() => setIsSettingsOpen(false)}
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
            <>
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
                                        icon={<Icon icon={faArrowUp} />}
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
                                        icon={<Icon icon={faArrowDown} />}
                                        onClick={() => onMoveDown()}
                                    />
                                )}
                            </section>
                            <span>
                                {config && (
                                    <Button
                                        small
                                        className={styles.dragbarButton}
                                        aria-label={'Moduleinstellungen'}
                                        onClick={() => setIsSettingsOpen(true)}
                                        icon={
                                            <Icon
                                                icon={faGear}
                                                className={clsx(
                                                    styles.buttonIcon,
                                                    {
                                                        [styles.activeButtonIcon]:
                                                            isSettingsOpen,
                                                    }
                                                )}
                                            />
                                        }
                                    />
                                )}
                                <Button
                                    small
                                    variant={'error'}
                                    icon={
                                        <Icon
                                            icon={faTrash}
                                            className={clsx(styles.buttonIcon)}
                                        />
                                    }
                                    aria-label={'Modul löschen'}
                                    style={{ float: 'right' }}
                                    onClick={() => onRemoveContentModule?.()}
                                />
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
                    {contentModule.type ===
                        ContentModuleType.IMAGE_COLLECTION && (
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
                {config && (
                    <Dialog
                        open={isSettingsOpen}
                        title={'Moduleinstellungen'}
                        onRequestClose={() => setIsSettingsOpen(false)}
                    >
                        <DialogContent>{config}</DialogContent>
                        <DialogActions>
                            <Button onClick={() => setIsSettingsOpen(false)}>
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </>
        );
    }
);
ContentModule.displayName = 'CM';
