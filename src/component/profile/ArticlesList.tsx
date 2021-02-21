import React, { memo, useCallback } from 'react';
import { makeStyles, Theme, Table, TableHead, TableRow, TableCell, TableBody, Link } from '@material-ui/core';
import { ArticleModel } from 'model';
import { User, Article } from 'util/model';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { UserAvatar } from 'component/user/UserAvatar';
import { useIsRetina } from 'util/useIsRetina';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(3, 2)
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center'
    },
    previewImage: {
        height: 40,
        width: 40,
        objectFit: 'cover'
    },
    usersList: {
        '& li': {
            display: 'flex'
        }
    },
    userAvatar: {
        display: 'inline-block',
        width: '1em',
        height: '1em'
    },
    responsiveTable: {
        [theme.breakpoints.down('sm')]: {
            '& thead': {
                display: 'none'
            },
            '& tr': {
                display: 'block',
                marginBottom: theme.spacing(2),
            },
            '& td': {
                display: 'block',
                '&:first-child, &:nth-child(2)': {
                    display: 'inline-block'
                },
                '&:nth-child(2)': {
                    float: 'right',
                },
                '&:empty': {
                    display: 'none'
                },
                '&:not(:last-child)': {
                    border: 'none',
                },
                '&:last-child': {
                    paddingBottom: theme.spacing(2)
                }
            }
        }
    }
}));

export interface ArticlesListProps {
    articles: ArticleModel[];
}

export const ArticlesList = memo<ArticlesListProps>(({ articles }) => {
    const styles = useStyles();
    const retinaMultiplier = useIsRetina() ? 2 : 1;

    const articleSorter = useCallback((article1, article2) => (new Date(article2.updatedAt).getTime() - new Date(article1.updatedAt).getTime()), []);

    return (
        <Table size={'small'} data-testid="ArticlesList" className={styles.responsiveTable}>
            <TableHead>
                <TableRow>
                    <TableCell>Erstelldatum</TableCell>
                    <TableCell>Autoren</TableCell>
                    <TableCell>Titel</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {[...articles].sort(articleSorter).map(article => (
                    <TableRow key={article.id}>
                        <TableCell>
                            {format(new Date(article.insertedAt), 'P', { locale: de }) + ' '}
                        </TableCell>
                        <TableCell>
                            <ul className={styles.usersList}>
                                {article.users.map(user => (
                                    <li key={user.id}>
                                        <UserAvatar className={styles.userAvatar} user={user} size={20} />
                                        {User.getNickname(user)}
                                    </li>
                                ))}
                            </ul>
                        </TableCell>
                        <TableCell>
                            <Link
                                color={'secondary'}
                                className={styles.link}
                                title={`Beitrag "${article.title}" bearbeiten`}
                                href={Article.getPath(article, { edit: true })}
                            >
                                {article.previewImageFile && (
                                    <img
                                        className={styles.previewImage}
                                        src={`https://afdptjdxen.cloudimg.io/cover/${40 * retinaMultiplier}x${40 * retinaMultiplier}/foil1/${article.previewImageFile.remoteLocation}`}
                                        alt={`Vorschaubild zum Beitrag "${article.title}"`}
                                    />
                                )}
                                {article.title}
                            </Link>
                        </TableCell>
                        <TableCell>
                            {article.category && (
                                <span>Sichtbar</span>
                            )}
                            {article.readyToPublish && !article.category && (
                                <span>Bereit zur Freigabe</span>
                            )}
                            {!article.readyToPublish && !article.category && (
                                <span>In Bearbeitung</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
});
