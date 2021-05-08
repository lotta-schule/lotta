import React, { memo, useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    makeStyles,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { OpenInNew } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { FileModel, ID, FileModelUsageLocation } from 'model';
import { GetFileDetailsQuery } from 'api/query/GetFileDetailsQuery';
import { UserAvatar } from 'component/user/UserAvatar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Category, Article, User } from 'util/model';
import { useTranslation } from 'react-i18next';
import fileExplorerContext from './context/FileExplorerContext';
import Img from 'react-cloudimage-responsive';

const useStyles = makeStyles((theme) => ({
    listItemText: {
        padding: theme.spacing(0, 1),
    },
    listItemTextLine: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}));

export const FileUsageModal = memo(() => {
    const styles = useStyles();
    const { t } = useTranslation();
    const current_user = useCurrentUser();
    const [{ showFileUsage, markedFiles }, dispatch] = useContext(
        fileExplorerContext
    );

    const { data } = useQuery<{ file: FileModel }, { id: ID }>(
        GetFileDetailsQuery,
        {
            variables: { id: markedFiles[0]?.id },
            skip: !showFileUsage || markedFiles.length !== 1 || !markedFiles[0],
        }
    );

    const hasSecondaryAction = (usage: FileModelUsageLocation) =>
        usage.article || usage.category || usage.user?.id === current_user?.id;

    const getSecondaryActionCallback = (usage: FileModelUsageLocation) => (
        e: React.MouseEvent<any>
    ) => {
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
        if (usage.system) {
            return `SeitenLayout ${usage.system.title}`;
        }
        return 'Verwendung unbekannt';
    };

    return (
        <Dialog
            open={showFileUsage && markedFiles.length === 1}
            onClose={() => dispatch({ type: 'hideFileUsage' })}
        >
            <DialogTitle>
                Nutzung der Datei {markedFiles[0]?.filename}
            </DialogTitle>
            <List>
                {data?.file?.usage?.map((usage, i) => (
                    <ListItem key={i}>
                        {usage.article?.previewImageFile?.remoteLocation && (
                            <ListItemAvatar>
                                <Img
                                    operation={'cover'}
                                    size={'150x100'}
                                    src={
                                        usage.article.previewImageFile
                                            .remoteLocation
                                    }
                                    alt={`Vorschaubild zu ${usage.article.title}`}
                                />
                            </ListItemAvatar>
                        )}
                        {usage.system?.logoImageFile?.remoteLocation && (
                            <ListItemAvatar>
                                <Img
                                    operation={'cover'}
                                    size={'150x100'}
                                    src={
                                        usage.system.logoImageFile
                                            .remoteLocation
                                    }
                                    alt={`Logo von ${usage.system.title}`}
                                />
                            </ListItemAvatar>
                        )}
                        {usage.user && (
                            <ListItemAvatar>
                                <UserAvatar user={usage.user} />
                            </ListItemAvatar>
                        )}
                        <ListItemText
                            classes={{
                                root: styles.listItemText,
                                primary: styles.listItemTextLine,
                                secondary: styles.listItemTextLine,
                            }}
                            primary={getPrimaryTextForUsage(usage)}
                            secondary={t(`files.usage.${usage.usage}`)}
                        />
                        {hasSecondaryAction(usage) && (
                            <ListItemSecondaryAction>
                                <Button
                                    onClick={getSecondaryActionCallback(usage)}
                                    icon={<OpenInNew />}
                                />
                            </ListItemSecondaryAction>
                        )}
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
});
