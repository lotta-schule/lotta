import React, { memo } from 'react';
import { ArticleModel } from '../../model';
import { Card, CardContent, Typography, Link, Grid, Fab, makeStyles, Theme } from '@material-ui/core';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { CollisionLink } from '../general/CollisionLink';
import { Edit, Place } from '@material-ui/icons';
import classNames from 'classnames';
import Img from 'react-cloudimage-responsive';
import { theme } from 'theme';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { useMutation } from 'react-apollo';
import { ToggleArticlePinMutation } from 'api/mutation/ToggleArticlePin';
import { ID } from 'model/ID';

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        padding: '0.5em',
        borderRadius: 0,
        '&:hover': {
            '& .edit-button': {
                border: 0,
                display: 'flex',
                color: '#fff',
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
        color: '#fff',
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
    previewtext: {
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
}

export const ArticlePreview = memo<ArticlePreviewProps>(({ article, disableLink, disableEdit, disablePin }) => {

    const [currentUser] = useCurrentUser();

    const styles = useStyle();

    const [toggleArticlePin] = useMutation<{ article: ArticleModel }, { id: ID }>(ToggleArticlePinMutation, {
        variables: { id: article.id }
    });

    return (
        <Card className={styles.root}>
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
                        <Typography component={'h5'} variant={'h5'} gutterBottom>
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
                        <Typography variant={'subtitle1'} style={{ textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: theme.spacing(1) }}>
                            {format(parseISO(article.insertedAt), 'PPP', { locale: de }) + ' '}
                            {article.topic && <> | {article.topic}&nbsp;</>}
                            {/* | 18 Views&nbsp; */}
                            {article.users && <>| Autoren: {article.users.map(a => a.nickname).join(', ')}&nbsp;</>}
                            {/* | Bewertung&nbsp; */}
                        </Typography>
                        <Typography variant={'subtitle1'} color="textSecondary" className={styles.previewtext}>
                            {article.preview}
                        </Typography>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    );
});