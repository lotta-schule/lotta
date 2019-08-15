
import React, { memo } from 'react';
import {
    makeStyles, Theme, Table, TableHead, TableRow, TableCell, TableBody, CardMedia, IconButton
} from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { ArticleModel } from 'model';
import { CollisionLink } from 'component/general/CollisionLink';
import { User } from 'util/model';
import { parseISO, format } from 'date-fns';
import { de } from 'date-fns/locale';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    headlines: {
        marginBottom: theme.spacing(2),
    },
    actionButton: {
        height: 24,
        width: 24,
        padding: 0
    },
}));

export interface ArticlesManagementProps {
    articles: ArticleModel[];
}

export const ArticlesManagement = memo<ArticlesManagementProps>(({ articles }) => {
    const styles = useStyles();

    return (
        <Table size={'small'}>
            <TableHead>
                <TableRow>
                    <TableCell></TableCell>
                    {/* <TableCell></TableCell> */}
                    <TableCell>Erstellungsdatum</TableCell>
                    <TableCell>Vorschaubild</TableCell>
                    <TableCell>Beitragsname</TableCell>
                    <TableCell>Autoren</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {articles.map(article => (
                    <TableRow key={article.id}>
                        <TableCell>
                            <IconButton
                                className={styles.actionButton}
                                aria-label={'Beitrag bearbeiten'}
                                component={CollisionLink}
                                to={`/article/${article.id}/edit`}
                            >
                                <Edit />
                            </IconButton>
                        </TableCell>
                        {/* <TableCell>
                            <Tooltip title="Beitrag löschen">
                                <IconButton className={styles.actionButton} aria-label="Beitrag löschen" onClick={() => { }}>
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </TableCell> */}
                        <TableCell>
                            {format(parseISO(article.insertedAt), 'PPP', { locale: de }) + ' '}
                        </TableCell>
                        <TableCell>
                            {article.previewImageFile && (
                                <CardMedia
                                    style={{ height: 50, width: 75 }}
                                    image={`https://afdptjdxen.cloudimg.io/cover/50x75/foil1/${article.previewImageFile.remoteLocation}`}
                                />
                            )}
                        </TableCell>
                        <TableCell><strong>{article.title}</strong></TableCell>
                        <TableCell>
                            <ul>
                                {article.users.map(user => (
                                    <li key={user.id}>{User.getNickname(user)}</li>
                                ))}
                            </ul>
                        </TableCell>
                        <TableCell>
                            {article.category && <span>Sichtbar</span>}
                            {article.readyToPublish && !article.category && <span>Bereit zur Freigabe</span>}
                            {!article.readyToPublish && !article.category && <span>In Bearbeitung</span>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
});