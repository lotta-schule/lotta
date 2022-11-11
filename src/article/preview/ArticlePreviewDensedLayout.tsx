import * as React from 'react';
import { Button, Box } from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client';
import {
    faCircle,
    faLocationDot,
    faPen,
} from '@fortawesome/free-solid-svg-icons';
import { format, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, File, User } from 'util/model';
import { Icon } from 'shared/Icon';
import { useIsMobile } from 'util/useIsMobile';
import { useServerData } from 'shared/ServerDataContext';
import { AuthorAvatarsList } from 'article/authorAvatarsList/AuthorAvatarsList';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import clsx from 'clsx';
import Link from 'next/link';

import styles from './ArticlePreviewDensedLayout.module.scss';

import ToggleArticlePinMutation from 'api/mutation/ToggleArticlePin.graphql';

interface ArticlePreviewProps {
    article: ArticleModel;
    disableLink?: boolean;
    disableEdit?: boolean;
    disablePin?: boolean;
    limitedHeight?: boolean;
    isEmbedded?: boolean;
}

export const ArticlePreviewDensedLayout = React.memo<ArticlePreviewProps>(
    ({
        article,
        disableLink,
        disableEdit,
        disablePin,
        limitedHeight,
        isEmbedded,
    }) => {
        const { baseUrl } = useServerData();
        const currentUser = useCurrentUser();
        const isMobile = useIsMobile();

        const [toggleArticlePin] = useMutation<
            { article: ArticleModel },
            { id: ID }
        >(ToggleArticlePinMutation, {
            variables: { id: article.id },
        });

        const maybeLinked = (content: any) =>
            disableLink ? (
                content
            ) : (
                <Link href={Article.getPath(article)} passHref>
                    <a>{content}</a>
                </Link>
            );

        return (
            <Box
                className={clsx(styles.root, {
                    [styles.isEmbedded]: isEmbedded,
                })}
                data-testid="ArticlePreviewDensedLayout"
            >
                <>
                    {article.previewImageFile && (
                        <div className={styles.previewImageWrapper}>
                            {maybeLinked(
                                <ResponsiveImage
                                    width={250}
                                    alt={`Vorschaubild zu ${article.title}`}
                                    aspectRatio={'4:3'}
                                    src={File.getFileRemoteLocation(
                                        baseUrl,
                                        article.previewImageFile
                                    )}
                                    sizes="(max-width: 500px) 100px, 100%"
                                    className={styles.articlePreviewImage}
                                />
                            )}
                        </div>
                    )}
                    <div className={styles.boxContent}>
                        <h3 className={styles.articleTitle}>
                            {!isEmbedded &&
                                currentUser &&
                                currentUser.lastSeen &&
                                isBefore(
                                    new Date(currentUser.lastSeen),
                                    new Date(article.updatedAt)
                                ) && (
                                    <Icon
                                        icon={faCircle}
                                        color={'secondary'}
                                        style={{
                                            fontSize: '0.5em',
                                            verticalAlign: 'baseline',
                                        }}
                                    />
                                )}
                            {maybeLinked(article.title)}
                        </h3>
                        <span
                            className={clsx(styles.previewText, {
                                [styles.previewTextLimitedHeight]:
                                    limitedHeight,
                            })}
                        >
                            {article.preview}
                        </span>
                    </div>
                    <div className={styles.meta}>
                        <span className={clsx(styles.subtitle)}>
                            {format(new Date(article.updatedAt), 'P', {
                                locale: de,
                            }) + ' '}
                        </span>
                        <span className={clsx(styles.subtitle)}>
                            {article.users && article.users.length > 0 && (
                                <>
                                    &nbsp;
                                    <AuthorAvatarsList users={article.users} />
                                </>
                            )}
                        </span>
                    </div>
                    {!isMobile &&
                        ((!disableEdit &&
                            User.canEditArticle(currentUser, article)) ||
                            (!disablePin && User.isAdmin(currentUser))) && (
                            <div className={styles.editSection}>
                                {!disableEdit &&
                                    User.canEditArticle(
                                        currentUser,
                                        article
                                    ) && (
                                        <Link
                                            href={Article.getPath(article, {
                                                edit: true,
                                            })}
                                            passHref
                                        >
                                            <Button
                                                small
                                                aria-label="Edit"
                                                className={clsx(
                                                    styles.editButton,
                                                    'edit-button'
                                                )}
                                                icon={
                                                    <Icon
                                                        icon={faPen}
                                                        size={'lg'}
                                                    />
                                                }
                                            />
                                        </Link>
                                    )}
                                {!disablePin && User.isAdmin(currentUser) && (
                                    <Button
                                        small
                                        aria-label="Pin"
                                        className={clsx(styles.pinButton, {
                                            active: article.isPinnedToTop,
                                        })}
                                        onClick={() => toggleArticlePin()}
                                        icon={
                                            <Icon
                                                icon={faLocationDot}
                                                size={'lg'}
                                            />
                                        }
                                    />
                                )}
                            </div>
                        )}
                </>
            </Box>
        );
    }
);
ArticlePreviewDensedLayout.displayName = 'ArticlePreviewDensedLayout';
