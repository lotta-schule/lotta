import * as React from 'react';
import { Typography, Link, Grid, makeStyles, Theme, Container, IconButton } from '@material-ui/core';
import { Edit, Place } from '@material-ui/icons';
import { fade } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User, Article } from 'util/model';
import { useMutation } from '@apollo/client';
import { ToggleArticlePinMutation } from 'api/mutation/ToggleArticlePin';
import { CollisionLink } from '../general/CollisionLink';
import { AuthorAvatarsList } from './AuthorAvatarsList';
import { useIsMobile } from 'util/useIsMobile';
import { Article as ArticleUtil } from 'util/model/Article';
import { useIsRetina } from 'util/useIsRetina';
import clsx from 'clsx';

const useStyle = makeStyles<Theme, { isEmbedded?: boolean, narrow?: boolean }>(theme => ({
    container: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        boxShadow: ({ isEmbedded }) => isEmbedded ? 'initial' : `1px 1px 2px ${fade(theme.palette.text.primary, .2)}`,
        '&:hover': {
            '& .edit-button': {
                color: theme.palette.secondary.main,
            },
        },
    },
    previewImage: {
        width: '100%',
        height: ({ narrow }) => narrow ? 'auto' : '100%',
        objectFit: 'cover',
        flexShrink: 0,
        flexGrow: 0,
        backgroundPosition: '0 0'
    },
    mainSection: {
        paddingLeft: theme.spacing(1.5),
        paddingRight: theme.spacing(1),
        width: '70%',
        [theme.breakpoints.down('xs')]: {
            border: 0,
            padding: theme.spacing(0.5),
            width: '100%',
        }
    },
    imageSection: {
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: ({ narrow }) => narrow ? '100%' : '30%'
        }
    },
    title: {
        ...(theme.overrides && (theme.overrides as any).LottaArticlePreview && (theme.overrides as any).LottaArticlePreview.title),
        fontSize: '1.4rem',
        wordBreak: 'break-word',
        hyphens: 'auto',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.2rem',
            lineHeight: 1.05
        }
    },
    previewSection: {
        marginBottom: theme.spacing(1),
        color: theme.palette.grey[600],
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        height: '3.2em',
        display: ({ narrow }) => narrow ? 'block' : 'flex',
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0.5),
        },
        [theme.breakpoints.down('sm')]: {
            display: 'flex !important',
            lineHeight: 1.5,
            '& span:last-child': {
                textAlign: 'right'
            }
        },
        '& span': {
            [theme.breakpoints.down('md')]: {
                display: ({ narrow }) => narrow ? 'block' : 'initial',
                width: ({ narrow }) => narrow ? '100%' : 'auto'
            }
        },
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
            color: theme.palette.secondary.main
        }
    },
    date: {
        paddingTop: theme.spacing(1),
        marginRight: theme.spacing(2),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0.5),
        }
    },
    topic: {
        border: '1px solid',
        borderColor: theme.palette.secondary.main,
        color: theme.palette.secondary.main,
        fontSize: '0.7rem',
        padding: '2px 4px',
        marginBottom: theme.spacing(1.5),
        borderRadius: 4,
        maxWidth: 'max-content',
        fontFamily: theme.typography.fontFamily
    },
    link: {
        width: '100%',
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
    narrow?: boolean;
}

export const ArticlePreviewStandardLayout = React.memo<ArticlePreviewProps>(({ article, disableLink, disableEdit, disablePin, isEmbedded, narrow }) => {
    const isMobile = useIsMobile();
    const retinaMultiplier = useIsRetina() ? 2 : 1;

    const currentUser = useCurrentUser();

    const styles = useStyle({ isEmbedded, narrow });
    const showEditSection = (User.canEditArticle(currentUser, article) || User.isAdmin(currentUser));

    const [toggleArticlePin] = useMutation<{ article: ArticleModel }, { id: ID }>(ToggleArticlePinMutation, {
        variables: { id: article.id }
    });

    const maybeLinked = (content: any) => disableLink ? content : (
        <Link
            component={CollisionLink}
            color='inherit'
            underline='none'
            to={Article.getPath(article)}
            className={styles.link}
        >
            {content ?? ''}
        </Link>
    );

    return (
        <Container className={styles.container} data-testid="ArticlePreviewStandardLayout">
            <Grid container>
                <Grid className={styles.imageSection} container>
                    {maybeLinked(article.previewImageFile && (
                        <img
                            className={styles.previewImage}
                            src={`https://afdptjdxen.cloudimg.io/bound/${400*retinaMultiplier}x${300*retinaMultiplier}/foil1/${article.previewImageFile.remoteLocation}`}
                            alt={`Vorschaubild zu ${article.title}`}
                        />
                    ))}
                </Grid>
                <Grid className={styles.mainSection}>
                    <Typography gutterBottom className={styles.title} role={'heading'}>
                        {maybeLinked(article.title)}
                    </Typography>
                    <Typography className={styles.previewSection} variant={'subtitle2'}>
                        {article.preview}
                    </Typography>
                    {article.topic && (
                        <div className={styles.topic}>
                            {article.topic}
                        </div>
                    )}
                    <Grid container>
                        <Grid item xs={9} style={{ display: 'flex' }}>
                            <Grid item>
                                <Typography
                                    className={clsx(styles.date, 'dt-updated')}
                                    component={'time'}
                                    variant={'subtitle1'}
                                    dateTime={article.updatedAt}
                                >
                                    {format(new Date(article.updatedAt), 'P', { locale: de }) + ' '}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <AuthorAvatarsList users={article.users} />
                            </Grid>
                        </Grid>
                        {(!isMobile || isEmbedded) && (
                            <Grid item xs={3}>
                                {showEditSection && (
                                    <section>
                                        {showEditSection && (
                                            <div className={styles.buttonSection}>
                                                {User.canEditArticle(currentUser, article) && !disableEdit && (
                                                    <IconButton
                                                        aria-label="Beitrag bearbeiten"
                                                        size="small"
                                                        className={clsx(styles.editButton, 'edit-button')}
                                                        component={CollisionLink}
                                                        to={ArticleUtil.getPath(article, { edit: true })}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                )}
                                                {User.isAdmin(currentUser) && !disablePin && (
                                                    <IconButton
                                                        aria-label="Beitrag an der Kategorie anpinnen"
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
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
});
