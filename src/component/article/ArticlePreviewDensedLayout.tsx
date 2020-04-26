import React, { memo } from 'react';
import { Card, CardContent, Typography, Link, Grid, Fab, makeStyles, Theme } from '@material-ui/core';
import { Edit, Place, FiberManualRecord } from '@material-ui/icons';
import { fade } from '@material-ui/core/styles';
import { format, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User, Article } from 'util/model';
import { useMutation } from '@apollo/react-hooks';
import { ToggleArticlePinMutation } from 'api/mutation/ToggleArticlePin';
import { CollisionLink } from '../general/CollisionLink';
import { AuthorAvatarsList } from './AuthorAvatarsList';
import { useIsMobile } from 'util/useIsMobile';
import clsx from 'clsx';
import Img from 'react-cloudimage-responsive';

const useStyle = makeStyles<Theme, { isEmbedded?: boolean }>(theme => ({
    root: {
        width: '100%',
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
    cardContent: {
        paddingLeft: `${theme.spacing(1)}px !important`,
        paddingRight: `${theme.spacing(1)}px !important`,
        paddingTop: '0 !important',
        paddingBottom: '0 !important'
    },
    previewText: {
        fontSize: '.85em',
        [theme.breakpoints.down('sm')]: {
            lineHeight: 1.1
        }
    },
    meta: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        '& > span': {
            textAlign: 'center'
        }
    },
    editSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    subtitle: {
        textTransform: 'uppercase',
        fontSize: '0.85rem',
        marginBottom: 0,
        [theme.breakpoints.down('sm')]: {
            lineHeight: 1.3
        },
        [theme.breakpoints.down('xs')]: {
            display: 'flex',
            lineHeight: 1.15
        }

    },
    editButton: {
        float: 'right',
        color: theme.palette.grey[400],
        background: 'transparent',
        transition: 'opacity ease-in 250ms',
        minHeight: 25,
        width: 25,
        height: 25,
        '& svg': {
            fontSize: '15px !important'
        }
    },
    pinButton: {
        minHeight: 25,
        width: 25,
        height: 25,
        float: 'right',
        color: theme.palette.grey[400],
        '& svg': {
            fontSize: '15px !important'
        },
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
        ...(theme.overrides && (theme.overrides as any).LottaArticlePreview && (theme.overrides as any).LottaArticlePreview.title),
        [theme.breakpoints.down('sm')]: {
            fontSize: '1em',
            fontWeight: 'bolder',
            lineHeight: 1
        }
    },
    previewTextLimitedHeight: {
        overflow: 'hidden',
        webkitLineClamp: 2,
        lineClamp: 2,
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

export const ArticlePreviewDensedLayout = memo<ArticlePreviewProps>(({ article, disableLink, disableEdit, disablePin, limitedHeight, isEmbedded }) => {

    const [currentUser] = useCurrentUser();

    const isMobile = useIsMobile();
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

    return (
        <Card className={styles.root} data-testid={'ArticlePreview'}>
            <Grid container style={{ display: 'flex', minHeight: 60 }}>
                {article.previewImageFile && (
                    <Grid item xs={2}>
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
                    <CardContent className={styles.cardContent}>
                        <Typography component={'h5'} variant={'h5'} gutterBottom className={styles.articleTitle}>
                            {!isEmbedded && currentUser && currentUser.lastSeen && isBefore(new Date(currentUser.lastSeen), new Date(article.updatedAt)) && (
                                <FiberManualRecord color={'secondary'} fontSize={'small'} />
                            )}
                            {maybeLinked(article.title)}
                        </Typography>
                        <Typography component={'span'} variant={'subtitle1'} color={'textSecondary'} className={clsx(styles.previewText, { [styles.previewTextLimitedHeight]: limitedHeight })}>
                            {article.preview}
                        </Typography>
                    </CardContent>
                </Grid>
                <Grid item xs={2} className={styles.meta}>
                    <Typography component={'span'} variant={'subtitle1'} className={clsx(styles.subtitle)}>
                        {format(new Date(article.updatedAt), 'P', { locale: de }) + ' '}
                    </Typography>
                    <Typography component={'span'} variant={'subtitle1'} className={clsx(styles.subtitle)}>
                        {article.topic && <> | {article.topic}&nbsp;</>}
                    </Typography>
                    <Typography component={'span'} variant={'subtitle1'} className={clsx(styles.subtitle)}>
                        {article.users && article.users.length > 0 && <>&nbsp;<AuthorAvatarsList users={article.users} />&nbsp;</>}
                    </Typography>
                </Grid>
                {!isMobile && ((!disableEdit && User.canEditArticle(currentUser, article)) || (!disablePin && User.isAdmin(currentUser))) && (
                    <Grid item xs={1} className={styles.editSection}>
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
                    </Grid>
                )}
            </Grid>
        </Card>
    );
});
