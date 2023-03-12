import * as React from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    List,
    ListItem,
    ListItemSecondaryText,
} from '@lotta-schule/hubert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { FileModel, ID, FileModelUsageLocation } from 'model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, Category, File, User } from 'util/model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useServerData } from 'shared/ServerDataContext';
import fileExplorerContext from './context/FileExplorerContext';

import GetFileDetailsQuery from 'api/query/GetFileDetailsQuery.graphql';

import styles from './FileUsageModal.module.scss';

export const FileUsageModal = React.memo(() => {
    const { baseUrl } = useServerData();
    const { t } = useTranslation();
    const current_user = useCurrentUser();
    const [{ showFileUsage, markedFiles }, dispatch] =
        React.useContext(fileExplorerContext);

    const { data } = useQuery<{ file: FileModel }, { id: ID }>(
        GetFileDetailsQuery,
        {
            variables: { id: markedFiles[0]?.id },
            skip: !showFileUsage || markedFiles.length !== 1 || !markedFiles[0],
        }
    );

    const hasSecondaryAction = (usage: FileModelUsageLocation) =>
        usage.article || usage.category || usage.user?.id === current_user?.id;

    const getSecondaryActionCallback =
        (usage: FileModelUsageLocation) => (_e: React.MouseEvent<any>) => {
            if (usage.user) {
                window.open('/profile');
            }
            if (usage.category) {
                window.open(Category.getPath(usage.category));
            }
            if (usage.article) {
                window.open(Article.getPath(usage.article));
            }
        };

    const getPrimaryTextForUsage = (usage: FileModelUsageLocation) => {
        if (usage.article) {
            return `Artikel: ${usage.article.title}`;
        }
        if (usage.category) {
            return `Kategorie: ${usage.category.title}`;
        }
        if (usage.user) {
            return `Nutzer: ${User.getNickname(usage.user)}`;
        }
        if (usage.tenant) {
            return `SeitenLayout ${usage.tenant.title}`;
        }
        return 'Verwendung unbekannt';
    };

    return (
        <Dialog
            className={styles.root}
            open={showFileUsage && markedFiles.length === 1}
            onRequestClose={() => dispatch({ type: 'hideFileUsage' })}
            title={`Nutzung der Datei ${markedFiles[0]?.filename}`}
        >
            <DialogContent>
                <List>
                    {data?.file?.usage?.map((usage, i) => (
                        <ListItem
                            key={i}
                            leftSection={
                                <>
                                    {usage.article?.previewImageFile && (
                                        <ResponsiveImage
                                            resize={'contain'}
                                            width={100}
                                            aspectRatio={'4:3'}
                                            src={File.getFileRemoteLocation(
                                                baseUrl,
                                                usage.article.previewImageFile
                                            )}
                                            alt={`Vorschaubild zu ${usage.article.title}`}
                                        />
                                    )}
                                    {usage.tenant?.configuration
                                        .logoImageFile && (
                                        <ResponsiveImage
                                            resize={'inside'}
                                            height={75}
                                            src={File.getFileRemoteLocation(
                                                baseUrl,
                                                usage.tenant.configuration
                                                    .logoImageFile
                                            )}
                                            alt={`Logo von ${usage.tenant.title}`}
                                        />
                                    )}
                                    {usage.user && (
                                        <UserAvatar
                                            user={usage.user}
                                            size={50}
                                        />
                                    )}
                                </>
                            }
                            rightSection={
                                hasSecondaryAction(usage) && (
                                    <Button
                                        onClick={getSecondaryActionCallback(
                                            usage
                                        )}
                                        icon={
                                            <FontAwesomeIcon
                                                icon={faUpRightFromSquare}
                                            />
                                        }
                                    />
                                )
                            }
                        >
                            <div className={styles.listItemTextLine}>
                                {getPrimaryTextForUsage(usage)}
                            </div>
                            <ListItemSecondaryText
                                className={styles.listItemTextLine}
                            >
                                {t(`files.usage.${usage.usage}`)}
                            </ListItemSecondaryText>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
});
FileUsageModal.displayName = 'FileUsageModal';
