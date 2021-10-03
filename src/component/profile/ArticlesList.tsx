import * as React from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@material-ui/core';
import { ArticleModel } from 'model';
import { User, Article, Category, File } from 'util/model';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { UserAvatar } from 'component/user/UserAvatar';
import { useIsRetina } from 'util/useIsRetina';
import { useServerData } from 'component/ServerDataContext';
import Link from 'next/link';
import getConfig from 'next/config';

import styles from './ArticlesList.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export interface ArticlesListProps {
    articles: ArticleModel[];
}

export const ArticlesList = React.memo<ArticlesListProps>(({ articles }) => {
    const { baseUrl } = useServerData();
    const retinaMultiplier = useIsRetina() ? 2 : 1;

    const articleSorter = React.useCallback(
        (article1, article2) =>
            new Date(article2.updatedAt).getTime() -
            new Date(article1.updatedAt).getTime(),
        []
    );

    return (
        <Table
            size={'small'}
            data-testid="ArticlesList"
            className={styles.root}
        >
            <TableHead>
                <TableRow>
                    <TableCell>Erstelldatum</TableCell>
                    <TableCell>Autoren</TableCell>
                    <TableCell>Titel</TableCell>
                    <TableCell>Kategorie</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {[...articles].sort(articleSorter).map((article) => (
                    <TableRow key={article.id}>
                        <TableCell>
                            {format(new Date(article.insertedAt), 'P', {
                                locale: de,
                            }) + ' '}
                        </TableCell>
                        <TableCell>
                            <ul className={styles.usersList}>
                                {article.users.map((user) => (
                                    <li key={user.id}>
                                        <UserAvatar
                                            className={styles.userAvatar}
                                            user={user}
                                            size={20}
                                        />
                                        {User.getNickname(user)}
                                    </li>
                                ))}
                            </ul>
                        </TableCell>
                        <TableCell>
                            <Link
                                href={Article.getPath(article, { edit: true })}
                                passHref
                            >
                                <a
                                    className={styles.link}
                                    title={`Beitrag "${article.title}" bearbeiten`}
                                >
                                    {article.previewImageFile && (
                                        <img
                                            className={styles.previewImage}
                                            src={`https://${cloudimageToken}.cloudimg.io/cover/${
                                                40 * retinaMultiplier
                                            }x${
                                                40 * retinaMultiplier
                                            }/foil1/${File.getFileRemoteLocation(
                                                baseUrl,
                                                article.previewImageFile
                                            )}`}
                                            alt={`Vorschaubild zum Beitrag "${article.title}"`}
                                        />
                                    )}
                                    {article.title}
                                </a>
                            </Link>
                        </TableCell>
                        <TableCell>
                            {article.category && (
                                <Link
                                    href={Category.getPath(article.category)}
                                    passHref
                                >
                                    <a
                                        className={styles.link}
                                        title={`${Category.getPath(
                                            article.category
                                        )} öffnen`}
                                    >
                                        {article.category.title}
                                    </a>
                                </Link>
                            )}
                        </TableCell>
                        <TableCell>
                            {article.published && <span>Veröffentlicht</span>}
                            {article.readyToPublish && !article.published && (
                                <span>Bereit zur Freigabe</span>
                            )}
                            {!article.readyToPublish && !article.published && (
                                <span>In Bearbeitung</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
});
ArticlesList.displayName = 'ArticlesList';
