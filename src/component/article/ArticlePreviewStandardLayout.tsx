import * as React from 'react';
import {
    Typography,
    Link,
    Grid,
    makeStyles,
    Input as MuiInput,
    Theme,
    Container,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { Edit, Place } from '@material-ui/icons';
import { fade } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, File, User } from 'util/model';
import { useMutation } from '@apollo/client';
import { ToggleArticlePinMutation } from 'api/mutation/ToggleArticlePin';
import { CollisionLink } from '../general/CollisionLink';
import { AuthorAvatarsList } from './AuthorAvatarsList';
import { useIsMobile } from 'util/useIsMobile';
import { Article as ArticleUtil } from 'util/model/Article';
import { useIsRetina } from 'util/useIsRetina';
import { useHistory } from 'react-router-dom';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { TagsSelect } from 'component/layouts/editArticleLayout/TagsSelect';
import { Tag } from 'component/general/tag/Tag';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { Input } from 'component/general/form/input/Input';
import clsx from 'clsx';
import Img from 'react-cloudimage-responsive';

const useStyle = makeStyles<Theme, { isEmbedded?: boolean; narrow?: boolean }>(
    (theme) => ({
        container: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(1),
            marginBottom: theme.spacing(1),
            borderRadius: theme.shape.borderRadius,
            boxShadow: ({ isEmbedded }) =>
                isEmbedded
                    ? 'initial'
                    : `1px 1px 2px ${fade(theme.palette.text.primary, 0.2)}`,
            '&:hover': {
                '& .edit-button': {
                    color: theme.palette.secondary.main,
                },
            },
        },
        previewImage: {
            width: '100%',
            height: ({ narrow }) => (narrow ? 'auto' : '100%'),
            objectFit: 'cover',
            flexShrink: 0,
            flexGrow: 0,
            backgroundPosition: '0 0',
        },
        mainSection: {
            paddingLeft: theme.spacing(1.5),
            paddingRight: theme.spacing(1),
            flexGrow: 1,
            [theme.breakpoints.down('xs')]: {
                border: 0,
                padding: theme.spacing(0.5),
                width: '100%',
            },
        },
        imageSection: {
            width: '100%',
            flexShrink: 0,
            [theme.breakpoints.up('sm')]: {
                width: ({ narrow }) => (narrow ? '100%' : '30%'),
            },
        },
        title: {
            ...(theme.overrides &&
                (theme.overrides as any).LottaArticlePreview &&
                (theme.overrides as any).LottaArticlePreview.title),
            fontSize: '1.4rem',
            wordBreak: 'break-word',
            hyphens: 'auto',
            [theme.breakpoints.down('sm')]: {
                fontSize: '1.2rem',
                lineHeight: 1.05,
            },
        },
        previewSection: {
            marginBottom: theme.spacing(1),
            color: theme.palette.grey[600],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '3.2em',
            display: ({ narrow }) => (narrow ? 'block' : 'flex'),
            [theme.breakpoints.down('xs')]: {
                padding: theme.spacing(0.5),
            },
            [theme.breakpoints.down('sm')]: {
                display: 'flex !important',
                lineHeight: 1.5,
                '& span:last-child': {
                    textAlign: 'right',
                },
            },
            '& span': {
                [theme.breakpoints.down('md')]: {
                    display: ({ narrow }) => (narrow ? 'block' : 'initial'),
                    width: ({ narrow }) => (narrow ? '100%' : 'auto'),
                },
            },
        },
        buttonSection: {
            textAlign: 'right',
            paddingTop: theme.spacing(1),
            [theme.breakpoints.down('xs')]: {
                padding: theme.spacing(0.5),
            },
        },
        editButton: {
            color: theme.palette.grey[400],
        },
        pinButton: {
            color: theme.palette.grey[400],
            '&.active': {
                color: theme.palette.secondary.main,
            },
        },
        dateGridItem: {
            display: 'flex',
            alignItems: 'baseline',
        },
        date: {
            paddingTop: theme.spacing(1),
            marginRight: theme.spacing(2),
            [theme.breakpoints.down('xs')]: {
                padding: theme.spacing(0.5),
            },
        },
        link: {
            width: '100%',
        },
    })
);

interface ArticlePreviewProps {
    article: ArticleModel;
    disableLink?: boolean;
    onUpdateArticle?: (article: ArticleModel) => void;
    disableEdit?: boolean;
    disablePin?: boolean;
    limitedHeight?: boolean;
    isEmbedded?: boolean;
    narrow?: boolean;
}

export const ArticlePreviewStandardLayout = React.memo<ArticlePreviewProps>(
    ({
        article,
        disableLink,
        disableEdit,
        disablePin,
        isEmbedded,
        narrow,
        onUpdateArticle,
    }) => {
        const isMobile = useIsMobile();
        const { push } = useHistory();
        const retinaMultiplier = useIsRetina() ? 2 : 1;

        const currentUser = useCurrentUser();

        const styles = useStyle({ isEmbedded, narrow });
        const showEditSection =
            User.canEditArticle(currentUser, article) ||
            User.isAdmin(currentUser);

        const [
            isSelfRemovalDialogOpen,
            setIsSelfRemovalDialogOpen,
        ] = React.useState(false);

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
                <Link
                    component={CollisionLink}
                    color="inherit"
                    underline="none"
                    to={Article.getPath(article)}
                    className={styles.link}
                >
                    {content ?? ''}
                </Link>
            );

        return (
            <Container
                className={styles.container}
                data-testid="ArticlePreviewStandardLayout"
            >
                <Grid container wrap={'nowrap'}>
                    <Grid className={styles.imageSection} container>
                        {!!onUpdateArticle && (
                            <SelectFileOverlay
                                allowDeletion
                                style={{ width: '100%' }}
                                label={'Vorschaubild ändern'}
                                onSelectFile={(previewImageFile) =>
                                    onUpdateArticle({
                                        ...article,
                                        previewImageFile,
                                    })
                                }
                            >
                                {article.previewImageFile ? (
                                    <Img
                                        operation={'width'}
                                        size={'300x200'}
                                        src={File.getFileRemoteLocation(
                                            article.previewImageFile
                                        )}
                                    />
                                ) : (
                                    <PlaceholderImage
                                        width={'100%'}
                                        height={150}
                                    />
                                )}
                            </SelectFileOverlay>
                        )}
                        {!onUpdateArticle &&
                            maybeLinked(
                                article.previewImageFile && (
                                    <img
                                        className={styles.previewImage}
                                        src={`https://afdptjdxen.cloudimg.io/bound/${
                                            400 * retinaMultiplier
                                        }x${
                                            300 * retinaMultiplier
                                        }/foil1/${File.getFileRemoteLocation(
                                            article.previewImageFile
                                        )}`}
                                        alt={`Vorschaubild zu ${article.title}`}
                                    />
                                )
                            )}
                    </Grid>
                    <Grid className={styles.mainSection}>
                        {!!onUpdateArticle && (
                            <Input
                                inline
                                fullWidth
                                value={article.title}
                                onChange={(e) => {
                                    onUpdateArticle({
                                        ...article,
                                        title: (e.target as HTMLInputElement)
                                            .value,
                                    });
                                }}
                                className={styles.title}
                                aria-label={'Article title'}
                            />
                        )}
                        {!onUpdateArticle && (
                            <Typography
                                gutterBottom
                                className={styles.title}
                                role={'heading'}
                                aria-label={'Article title'}
                            >
                                {maybeLinked(article.title)}
                            </Typography>
                        )}
                        {!!onUpdateArticle && (
                            <MuiInput
                                fullWidth
                                multiline
                                disableUnderline
                                placeholder={
                                    'Füge dem Beitrag einen kurzen Vorschautext hinzu.'
                                }
                                value={article.preview}
                                onChange={(e) => {
                                    onUpdateArticle({
                                        ...article,
                                        preview: (e.target as HTMLInputElement)
                                            .value,
                                    });
                                }}
                                className={styles.previewSection}
                                inputProps={{
                                    'aria-label': 'Article preview text',
                                }}
                            />
                        )}
                        {!onUpdateArticle && (
                            <Typography
                                className={styles.previewSection}
                                variant={'subtitle2'}
                                aria-label={'Article preview Text'}
                            >
                                {article.preview}
                            </Typography>
                        )}
                        {!!onUpdateArticle && (
                            <TagsSelect
                                value={article.tags ?? []}
                                onChange={(tags) => {
                                    onUpdateArticle({ ...article, tags });
                                }}
                            />
                        )}
                        {!onUpdateArticle &&
                            article.tags?.map((tag) => (
                                <Tag key={tag}>{tag}</Tag>
                            ))}
                        <Grid container>
                            <Grid item className={styles.dateGridItem}>
                                <Typography
                                    className={clsx(styles.date, 'dt-updated')}
                                    component={'time'}
                                    variant={'subtitle1'}
                                    dateTime={article.updatedAt}
                                >
                                    {format(new Date(article.updatedAt), 'P', {
                                        locale: de,
                                    }) + ' '}
                                </Typography>
                            </Grid>
                            <Grid item style={{ flexGrow: 1 }}>
                                <AuthorAvatarsList
                                    max={
                                        !!onUpdateArticle ? Infinity : undefined
                                    }
                                    users={article.users}
                                    onUpdate={
                                        !!onUpdateArticle
                                            ? (users) => {
                                                  if (
                                                      users.length ===
                                                          article.users.length -
                                                              1 &&
                                                      article.users.find(
                                                          (u) =>
                                                              u.id ===
                                                              currentUser!.id
                                                      ) &&
                                                      !users.find(
                                                          (u) =>
                                                              u.id ===
                                                              currentUser!.id
                                                      )
                                                  ) {
                                                      setIsSelfRemovalDialogOpen(
                                                          true
                                                      );
                                                  } else {
                                                      onUpdateArticle({
                                                          ...article,
                                                          users,
                                                      });
                                                  }
                                              }
                                            : undefined
                                    }
                                />
                                <ResponsiveFullScreenDialog
                                    open={isSelfRemovalDialogOpen}
                                >
                                    <DialogTitle>
                                        Dich selbst aus dem Beitrag entfernen
                                    </DialogTitle>
                                    <DialogContent>
                                        <p>
                                            Möchtest du dich selbst wirklich aus
                                            dem Beitrag "{article.title}"
                                            entfernen?
                                        </p>
                                        <p>
                                            Du wirst den Beitrag dann nicht mehr
                                            bearbeiten können und übergibst die
                                            Rechte den anderen Autoren oder
                                            Administratoren der Seite
                                        </p>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            onClick={() =>
                                                setIsSelfRemovalDialogOpen(
                                                    false
                                                )
                                            }
                                        >
                                            abbrechen
                                        </Button>
                                        <Button
                                            color={'secondary'}
                                            onClick={() => {
                                                onUpdateArticle!({
                                                    ...article,
                                                    users: article.users.filter(
                                                        (articleUser) =>
                                                            articleUser.id !==
                                                            currentUser?.id
                                                    ),
                                                });
                                                setIsSelfRemovalDialogOpen(
                                                    false
                                                );
                                            }}
                                        >
                                            endgültig entfernen
                                        </Button>
                                    </DialogActions>
                                </ResponsiveFullScreenDialog>
                            </Grid>
                        </Grid>
                    </Grid>
                    {(!isMobile || isEmbedded) && (
                        <Grid item xs={1}>
                            {showEditSection && (
                                <section>
                                    {showEditSection && (
                                        <div className={styles.buttonSection}>
                                            {User.canEditArticle(
                                                currentUser,
                                                article
                                            ) &&
                                                !disableEdit && (
                                                    <Button
                                                        aria-label="Beitrag bearbeiten"
                                                        className={clsx(
                                                            styles.editButton,
                                                            'edit-button'
                                                        )}
                                                        onClick={(
                                                            e: React.MouseEvent
                                                        ) => {
                                                            e.stopPropagation();
                                                            push(
                                                                ArticleUtil.getPath(
                                                                    article,
                                                                    {
                                                                        edit: true,
                                                                    }
                                                                )
                                                            );
                                                        }}
                                                        icon={<Edit />}
                                                    />
                                                )}
                                            {User.isAdmin(currentUser) &&
                                                !disablePin && (
                                                    <Button
                                                        aria-label="Beitrag an der Kategorie anpinnen"
                                                        className={clsx(
                                                            styles.pinButton,
                                                            {
                                                                active:
                                                                    article.isPinnedToTop,
                                                            }
                                                        )}
                                                        onClick={() =>
                                                            toggleArticlePin()
                                                        }
                                                        icon={<Place />}
                                                    />
                                                )}
                                        </div>
                                    )}
                                </section>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Container>
        );
    }
);
