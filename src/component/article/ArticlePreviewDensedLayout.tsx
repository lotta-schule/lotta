import * as React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';
import { Edit, Place, FiberManualRecord } from '@material-ui/icons';
import { format, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, File, User } from 'util/model';
import { useMutation } from '@apollo/client';
import { AuthorAvatarsList } from './AuthorAvatarsList';
import { useIsMobile } from 'util/useIsMobile';
import { BackgroundImg } from 'react-cloudimage-responsive';
import { Button } from 'component/general/button/Button';
import { useServerData } from 'component/ServerDataContext';
import ToggleArticlePinMutation from 'api/mutation/ToggleArticlePin.graphql';
import clsx from 'clsx';
import Link from 'next/link';

import styles from './ArticlePreviewDensedLayout.module.scss';

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
            <Card
                className={clsx(styles.root, {
                    [styles.isEmbedded]: isEmbedded,
                })}
                data-testid="ArticlePreviewDensedLayout"
            >
                <Grid
                    container
                    style={{
                        position: 'relative',
                        display: 'flex',
                        minHeight: 60,
                    }}
                >
                    {article.previewImageFile && (
                        <Grid item xs={2} style={{ position: 'relative' }}>
                            {maybeLinked(
                                <BackgroundImg
                                    height={'100%'}
                                    src={File.getFileRemoteLocation(
                                        baseUrl,
                                        article.previewImageFile
                                    )}
                                    className={styles.articlePreviewImage}
                                    params="func=crop&gravity=auto"
                                />
                            )}
                        </Grid>
                    )}
                    <Grid item xs>
                        <CardContent className={styles.cardContent}>
                            <h5 className={styles.articleTitle}>
                                {!isEmbedded &&
                                    currentUser &&
                                    currentUser.lastSeen &&
                                    isBefore(
                                        new Date(currentUser.lastSeen),
                                        new Date(article.updatedAt)
                                    ) && (
                                        <FiberManualRecord
                                            color={'secondary'}
                                            fontSize={'small'}
                                        />
                                    )}
                                {maybeLinked(article.title)}
                            </h5>
                            <span
                                className={clsx(styles.previewText, {
                                    [styles.previewTextLimitedHeight]:
                                        limitedHeight,
                                })}
                            >
                                {article.preview}
                            </span>
                        </CardContent>
                    </Grid>
                    <Grid item xs={2} className={styles.meta}>
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
                                    &nbsp;
                                </>
                            )}
                        </span>
                    </Grid>
                    {!isMobile &&
                        ((!disableEdit &&
                            User.canEditArticle(currentUser, article)) ||
                            (!disablePin && User.isAdmin(currentUser))) && (
                            <Grid item xs={1} className={styles.editSection}>
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
                                                icon={<Edit />}
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
                                        icon={<Place />}
                                    />
                                )}
                            </Grid>
                        )}
                </Grid>
            </Card>
        );
    }
);
