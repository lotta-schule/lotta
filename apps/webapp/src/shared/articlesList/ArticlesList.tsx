import * as React from 'react';
import { Table } from '@lotta-schule/hubert';
import { ArticleModel } from 'model';
import { User, Article, Category, File } from 'util/model';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useServerData } from 'shared/ServerDataContext';
import Link from 'next/link';

import styles from './ArticlesList.module.scss';
import clsx from 'clsx';

export interface ArticlesListProps {
  articles: ArticleModel[];
}

export const ArticlesList = React.memo(({ articles }: ArticlesListProps) => {
  const { baseUrl } = useServerData();

  const articleSorter = React.useCallback(
    (article1: ArticleModel, article2: ArticleModel) =>
      new Date(article2.updatedAt).getTime() -
      new Date(article1.updatedAt).getTime(),
    []
  );

  return (
    <Table data-testid="ArticlesList" className={styles.root}>
      <thead>
        <tr>
          <td>Erstelldatum</td>
          <td>Autoren</td>
          <td>Titel</td>
          <td>Kategorie</td>
          <td>Status</td>
        </tr>
      </thead>
      <tbody>
        {[...articles].sort(articleSorter).map((article) => (
          <tr key={article.id}>
            <td>
              {format(new Date(article.insertedAt), 'P', {
                locale: de,
              }) + ' '}
            </td>
            <td>
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
            </td>
            <td>
              <Link
                href={Article.getPath(article, { edit: true })}
                passHref
                className={styles.link}
                title={`Beitrag "${article.title}" bearbeiten`}
              >
                {article.previewImageFile && (
                  <ResponsiveImage
                    className={styles.previewImage}
                    width={60}
                    aspectRatio={'3:2'}
                    src={File.getFileRemoteLocation(
                      baseUrl,
                      article.previewImageFile
                    )}
                    alt={`Vorschaubild zum Beitrag "${article.title}"`}
                  />
                )}
                {article.title}
              </Link>
            </td>
            <td>
              {article.category && (
                <Link
                  href={Category.getPath(article.category)}
                  passHref
                  className={styles.link}
                  title={`${Category.getPath(article.category)} öffnen`}
                >
                  {article.category.title}
                </Link>
              )}
            </td>
            <td>
              {article.published && (
                <div className={styles.progressSection}>
                  <div
                    className={clsx(styles.colorTag, styles.published)}
                  ></div>
                  <span>Veröffentlicht</span>
                </div>
              )}
              {article.readyToPublish && !article.published && (
                <div className={styles.progressSection}>
                  <div
                    className={clsx(styles.colorTag, styles.readyToPublish)}
                  ></div>
                  <span>Bereit zur Freigabe</span>
                </div>
              )}
              {!article.readyToPublish && !article.published && (
                <div className={styles.progressSection}>
                  <div
                    className={clsx(styles.colorTag, styles.inProcess)}
                  ></div>
                  <span>In Bearbeitung</span>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
});
ArticlesList.displayName = 'ArticlesList';
