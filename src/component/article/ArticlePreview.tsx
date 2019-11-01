import React, { memo } from 'react';
import { ArticleModel } from '../../model';
import { Card, CardContent, Typography, Link, Grid, Fab, makeStyles, Theme } from '@material-ui/core';
import { format, isBefore, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { CollisionLink } from '../general/CollisionLink';
import { Edit, Place, FiberManualRecord } from '@material-ui/icons';
import classNames from 'classnames';
import Img from 'react-cloudimage-responsive';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { useMutation } from 'react-apollo';
import { ToggleArticlePinMutation } from 'api/mutation/ToggleArticlePin';
import { ID } from 'model/ID';

const useStyle = makeStyles<Theme, { isEmbedded?: boolean }>(theme => ({
    root: {
        padding: '0.5em',
        borderRadius: 4,
        boxShadow: ({ isEmbedded }) => isEmbedded ? 'initial' : '1px 1px 2px #0000003b',
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
        color: '#ccc',
        background: 'transparent',
        transition: 'opacity ease-in 250ms',
    },
    pinButton: {
        float: 'right',
        color: theme.palette.primary.contrastText,
        marginRight: '1em',
        '&.active': {
            color: '#333'
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
        textTransform: 'uppercase',
        fontSize: '0.8rem',
        marginBottom: theme.spacing(1)
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

    return (
        <Card className={styles.root} data-testid={'ArticlePreview'}>
            <Grid container style={{ display: 'flex' }}>
                {article.previewImageFile && (
                    <Grid item xs={12} sm={4}>
                        <Img
                            operation={'cover'}
                            size={'300x200'}
                            src={article.previewImageFile.remoteLocation}
                            className={styles.articlePreviewImage}
                            alt={`Vorschaubild zu ${article.title}`}
                        />
                    </Grid>
                )}
                <Grid item xs>
                    <CardContent>
                        <Typography component={'h5'} variant={'h5'} gutterBottom className={styles.articleTitle}>
                            {!isEmbedded && currentUser && currentUser.lastSeen && isBefore(parseISO(currentUser.lastSeen), parseISO(article.updatedAt)) && (
                                <FiberManualRecord color={'secondary'} fontSize={'small'} />
                            )}
                            {disableLink && (article.title)}
                            {!disableLink && (
                                <Link
                                    component={CollisionLink}
                                    color='inherit'
                                    underline='none'
                                    to={`/article/${article.id}`}
                                >
                                    {article.title}
                                </Link>
                            )}
                            {!disableEdit && User.canEditArticle(currentUser, article) && (
                                <Fab
                                    aria-label="Edit"
                                    size="small"
                                    className={classNames(styles.editButton, 'edit-button')}
                                    component={CollisionLink}
                                    to={`/article/${article.id}/edit`}
                                >
                                    <Edit />
                                </Fab>
                            )}
                            {!disablePin && User.isAdmin(currentUser) && (
                                <Fab
                                    aria-label="Pin"
                                    size="small"
                                    className={classNames(styles.pinButton, { active: article.isPinnedToTop })}
                                    onClick={() => toggleArticlePin()}
                                >
                                    <Place />
                                </Fab>
                            )}
                        </Typography>
                        <Typography variant={'subtitle1'} className={classNames(styles.subtitle)}>
                            {format(parseISO(article.updatedAt), 'PPP', { locale: de }) + ' '}
                            {article.topic && <> | {article.topic}&nbsp;</>}
                            {/* | 18 Views&nbsp; */}
                            {article.users && <> | Autoren: {article.users.map(user => User.getNickname(user)).join(', ')}&nbsp;</>}
                            {/* | Bewertung&nbsp; */}
                        </Typography>
                        <Typography variant={'subtitle1'} color="textSecondary" className={classNames({ [styles.previewTextLimitedHeight]: limitedHeight })}>
                            {article.preview}
                        </Typography>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    );
});