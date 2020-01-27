import React, { memo, useMemo } from 'react';
import { Avatar, Card, CardContent, Typography, Link, Grid, Fab, makeStyles, Theme, Tooltip } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import { Edit, Place, FiberManualRecord } from '@material-ui/icons';
import { fade } from '@material-ui/core/styles';
import { format, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User, Article } from 'util/model';
import { useMutation } from 'react-apollo';
import { ToggleArticlePinMutation } from 'api/mutation/ToggleArticlePin';
import { CollisionLink } from '../general/CollisionLink';
import clsx from 'clsx';
import Img from 'react-cloudimage-responsive';

const useStyle = makeStyles<Theme, { isEmbedded?: boolean }>(theme => ({
    root: {
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        boxShadow: ({ isEmbedded }) => isEmbedded ? 'initial' : `1px 1px 2px ${fade(theme.palette.text.primary, .2)}`,
        '&:hover': {
            '& .edit-button': {
                border: 0,
                display: 'flex',
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.secondary.main,
            },
        }
    },
    editButton: {
        float: 'right',
        color: theme.palette.grey[400],
        background: 'transparent',
        transition: 'opacity ease-in 250ms',
    },
    pinButton: {
        float: 'right',
        color: theme.palette.grey[400],
        marginRight: '1em',
        '&.active': {
            color: theme.palette.grey[700]
        }
    },
    articlePreviewImage: {
        width: '100%',
        height: 'auto',
        flexShrink: 0,
        flexGrow: 0,
        backgroundPosition: '0 0'
    },
    articleTitle: {
        ...(theme.overrides && (theme.overrides as any).LottaArticlePreview && (theme.overrides as any).LottaArticlePreview.title)
    },
    subtitle: {
        display: 'flex',
        alignItems: 'center',
        textTransform: 'uppercase',
        fontSize: '0.85rem',
        marginBottom: theme.spacing(1)
    },
    authorAvatarGroup: {
        marginLeft: theme.spacing(2),
        display: 'inline-flex',
    },
    authorAvatar: {
        width: '1em',
        height: '1em',
        borderWidth: 1,
        '@media screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 2dppx)': {
            borderWidth: .5,
        }
    },
    previewTextLimitedHeight: {
        overflow: 'hidden',
        webkitLineClamp: 3,
        lineClamp: 3,
        WebkitBoxOrient: 'vertical',
        boxOrient: 'vertical',
        display: '-webkit-box',
    }
}
));

interface ArticlePreviewProps {
    article: ArticleModel;
    disableLink?: boolean;
    disableEdit?: boolean;
    disablePin?: boolean;
    limitedHeight?: boolean;
    isEmbedded?: boolean;
}

export const ArticlePreview = memo<ArticlePreviewProps>(({ article, disableLink, disableEdit, disablePin, limitedHeight, isEmbedded }) => {

    const [currentUser] = useCurrentUser();

    const styles = useStyle({ isEmbedded });

    const [toggleArticlePin] = useMutation<{ article: ArticleModel }, { id: ID }>(ToggleArticlePinMutation, {
        variables: { id: article.id }
    });

    const maybeLinked = (content: any) => disableLink ? content : (
        <Link
            component={CollisionLink}
            color='inherit'
            underline='none'
            to={Article.getPath(article)}
        >
            {content}
        </Link>
    );

    const authorsList = useMemo(() => {
        if (!article.users) {
            return null;
        }
        return (
            <AvatarGroup className={styles.authorAvatarGroup}>
                {article.users.map(user => (
                    <Tooltip title={User.getNickname(user)} key={user.id}>
                        <Avatar src={User.getAvatarUrl(user)} className={styles.authorAvatar} />
                    </Tooltip>
                ))}
            </AvatarGroup>
        )
    }, [article.users, styles.authorAvatar, styles.authorAvatarGroup]);

    return (
        <Card className={styles.root} data-testid={'ArticlePreview'}>
            <Grid container style={{ display: 'flex' }}>
                {article.previewImageFile && (
                    <Grid item xs={12} sm={4}>
                        {maybeLinked(
                            <Img
                                operation={'cover'}
                                size={'300x200'}
                                src={article.previewImageFile.remoteLocation}
                                className={styles.articlePreviewImage}
                                alt={`Vorschaubild zu ${article.title}`}
                            />
                        )}
                    </Grid>
                )}
                <Grid item xs>
                    <CardContent>
                        <Typography component={'h5'} variant={'h5'} gutterBottom className={styles.articleTitle}>
                            {!isEmbedded && currentUser && currentUser.lastSeen && isBefore(new Date(currentUser.lastSeen), new Date(article.updatedAt)) && (
                                <FiberManualRecord color={'secondary'} fontSize={'small'} />
                            )}
                            {maybeLinked(article.title)}
                            {!disableEdit && User.canEditArticle(currentUser, article) && (
                                <Fab
                                    aria-label="Edit"
                                    size="small"
                                    className={clsx(styles.editButton, 'edit-button')}
                                    component={CollisionLink}
                                    to={Article.getPath(article, { edit: true })}
                                >
                                    <Edit />
                                </Fab>
                            )}
                            {!disablePin && User.isAdmin(currentUser) && (
                                <Fab
                                    aria-label="Pin"
                                    size="small"
                                    className={clsx(styles.pinButton, { active: article.isPinnedToTop })}
                                    onClick={() => toggleArticlePin()}
                                >
                                    <Place />
                                </Fab>
                            )}
                        </Typography>
                        <Typography variant={'subtitle1'} className={clsx(styles.subtitle)}>
                            {format(new Date(article.updatedAt), 'PPP', { locale: de }) + ' '}
                            {article.topic && <> | {article.topic}&nbsp;</>}
                            {article.users && article.users.length > 0 && <>&nbsp;{authorsList}&nbsp;</>}
                        </Typography>
                        <Typography variant={'subtitle1'} color="textSecondary" className={clsx({ [styles.previewTextLimitedHeight]: limitedHeight })}>
                            {article.preview}
                        </Typography>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    );
});
