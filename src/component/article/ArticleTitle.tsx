import React, { memo } from 'react';
import { Typography, makeStyles, Theme, Grid, IconButton, Container } from '@material-ui/core';
import { ArticleModel, ID } from 'model';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AuthorAvatarsList } from './AuthorAvatarsList';
import { Header } from 'component/general/Header';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useMutation } from '@apollo/client';
import { ToggleArticlePinMutation } from 'api/mutation/ToggleArticlePin';
import { Edit, Place } from '@material-ui/icons';
import { CollisionLink } from 'component/general/CollisionLink';
import clsx from 'clsx';
import { Article as ArticleUtil } from 'util/model/Article';

export interface ArticleTitleProps {
    article: ArticleModel;
}

const useStyles = makeStyles<Theme>(theme => ({
    container: {
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: theme.palette.grey[300],
        paddingLeft: 0,
        paddingRight: 0,
    },
    outerGrid: {
        height: '100%',
    },
    previewImage: {
        width: '100%',
        maxHeight: 200,
        objectFit: 'cover',
    },
    mainSection: {
        paddingLeft: theme.spacing(1.5),
        paddingRight: theme.spacing(1),
        borderRight: '1px solid',
        borderRightColor: theme.palette.grey[300],
        [theme.breakpoints.down('sm')]: {
            border: 0,
            padding: theme.spacing(0.5),
        }
    },
    title: {
        fontSize: '1.3rem',
        textTransform: 'uppercase',
        letterSpacing: 2,
        [theme.breakpoints.down('sm')]: {
            wordWrap: 'break-word',
            hyphens: 'auto',
            fontSize: '1.2rem'
        }
    },
    previewSection: {
        padding: theme.spacing(1),
        color: theme.palette.grey[600],
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0.5),
        }
    },
    buttonSection: {
        textAlign: 'right',
        paddingTop: theme.spacing(1),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0.5),
        }
    },
    editButton: {
        color: theme.palette.grey[400],
    },
    pinButton: {
        color: theme.palette.grey[400],
        '&.active': {
            color: theme.palette.text.primary
        }
    },
    date: {
        paddingTop: theme.spacing(1),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0.5),
        }
    },
    topic: {
        border: '1px solid',
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        fontSize: '0.7rem',
        padding: '2px 4px',
        borderRadius: 4,
        maxWidth: 'max-content',
        fontFamily: theme.typography.fontFamily
    }
}));

export const ArticleTitle = memo<ArticleTitleProps>(({ article }) => {
    const styles = useStyles();
    const [currentUser] = useCurrentUser();

    const [toggleArticlePin] = useMutation<{ article: ArticleModel }, { id: ID }>(ToggleArticlePinMutation, {
        variables: { id: article.id }
    });
    const showEditSection = (User.canEditArticle(currentUser, article) || User.isAdmin(currentUser));
    return (
        <Container className={styles.container}>
        <Header>
            <Grid container>
                <Grid item xs={12} sm={3} container className={styles.outerGrid}>
                    {article.previewImageFile && (
                        <img
                            className={styles.previewImage}
                            src={`https://afdptjdxen.cloudimg.io/cover/320x240/foil1/${article.previewImageFile.remoteLocation}`}
                            alt={`Vorschaubild zu ${article.title}`}
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={9} className={styles.mainSection}>
                    <Typography gutterBottom className={styles.title}>
                        {article.title}
                    </Typography>
                    <Grid container>
                        <Grid item xs={12} sm={3}>
                            <Typography className={styles.date} component={'div'} variant={'subtitle1'}>
                                <>&nbsp;<AuthorAvatarsList users={article.users} />&nbsp;</>
                                {format(new Date(article.updatedAt), 'P', { locale: de }) + ' '}
                            </Typography>
                            <div className={styles.topic}>
                            {article.topic && <> {article.topic}</>}
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={9}>
                            <Grid container>
                                <Grid item sm={10}>
                                    <Typography className={styles.previewSection} variant={'subtitle2'}>
                                        {article.preview}
                                    </Typography>
                                </Grid>
                                <Grid item sm={2}>
                                {(article.preview || showEditSection) && (
                                    <section>
                                            {showEditSection && (
                                                <div className={styles.buttonSection}>
                                                    {User.canEditArticle(currentUser, article) && (
                                                        <IconButton
                                                            aria-label="Edit"
                                                            size="small"
                                                            className={clsx(styles.editButton, 'edit-button')}
                                                            component={CollisionLink}
                                                            to={ArticleUtil.getPath(article, { edit: true })}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                    )}
                                                    {User.isAdmin(currentUser) && (
                                                        <IconButton
                                                            aria-label="Pin"
                                                            size="small"
                                                            className={clsx(styles.pinButton, { active: article.isPinnedToTop })}
                                                            onClick={() => toggleArticlePin()}
                                                        >
                                                            <Place />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            )}
                                    </section>
                                )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Header>
        </Container>
    )
});
