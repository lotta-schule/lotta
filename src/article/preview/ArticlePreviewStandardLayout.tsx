import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faLocationDot, faPen } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, File, User } from 'util/model';
import { useMutation } from '@apollo/client';
import { useIsMobile } from 'util/useIsMobile';
import { Article as ArticleUtil } from 'util/model/Article';
import { useIsRetina } from 'util/useIsRetina';
import {
    Button,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    Input,
    Tag,
} from '@lotta-schule/hubert';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useServerData } from 'shared/ServerDataContext';
import { TagsSelect } from '../editor/TagsSelect';
import { AuthorAvatarsList } from 'article/authorAvatarsList/AuthorAvatarsList';
import Img from 'react-cloudimage-responsive';
import Link from 'next/link';
import getConfig from 'next/config';
import clsx from 'clsx';

import ToggleArticlePinMutation from 'api/mutation/ToggleArticlePin.graphql';

import styles from './ArticlePreviewStandardLayout.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

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
        const { baseUrl } = useServerData();
        const isMobile = useIsMobile();
        const retinaMultiplier = useIsRetina() ? 2 : 1;

        const currentUser = useCurrentUser();

        const showEditSection =
            User.canEditArticle(currentUser, article) ||
            User.isAdmin(currentUser);

        const [isSelfRemovalDialogOpen, setIsSelfRemovalDialogOpen] =
            React.useState(false);

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
                <Link href={Article.getPath(article)}>
                    <a
                        color={'inherit'}
                        style={{ textDecoration: 'none' }}
                        className={styles.link}
                    >
                        {content ?? ''}
                    </a>
                </Link>
            );

        return (
            <Box
                className={clsx(styles.root, {
                    [styles.narrow]: narrow,
                    [styles.isEmbedded]: isEmbedded,
                })}
                data-testid="ArticlePreviewStandardLayout"
            >
                <div className={styles.containerGrid}>
                    <div className={styles.imageSection}>
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
                                            baseUrl,
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
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        className={styles.previewImage}
                                        src={`https://${cloudimageToken}.cloudimg.io/bound/${
                                            400 * retinaMultiplier
                                        }x${
                                            300 * retinaMultiplier
                                        }/foil1/${File.getFileRemoteLocation(
                                            baseUrl,
                                            article.previewImageFile
                                        )}`}
                                        alt={`Vorschaubild zu ${article.title}`}
                                    />
                                )
                            )}
                    </div>
                    <div className={styles.mainSection}>
                        {!!onUpdateArticle && (
                            <Input
                                inline
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
                            <div
                                className={styles.title}
                                role={'heading'}
                                aria-level={1}
                                aria-label={'Article title'}
                            >
                                {maybeLinked(article.title)}
                            </div>
                        )}
                        {!!onUpdateArticle && (
                            <Input
                                multiline
                                inline
                                placeholder={
                                    'Füge dem Beitrag einen kurzen Vorschautext hinzu.'
                                }
                                maxLength={140}
                                value={article.preview}
                                onChange={(e) => {
                                    onUpdateArticle({
                                        ...article,
                                        preview: (e.target as HTMLInputElement)
                                            .value,
                                    });
                                }}
                                className={styles.previewSection}
                                aria-label={'Article preview text'}
                            />
                        )}
                        {!onUpdateArticle && (
                            <div
                                className={styles.previewSection}
                                aria-label={'Article preview Text'}
                            >
                                {article.preview}
                            </div>
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
                        <div className={styles.metaSection}>
                            <div className={styles.dateGridItem}>
                                <time
                                    className={clsx(styles.date, 'dt-updated')}
                                    dateTime={article.updatedAt}
                                >
                                    {format(new Date(article.updatedAt), 'P', {
                                        locale: de,
                                    }) + ' '}
                                </time>
                            </div>
                            <div className={styles.authorAvatarsList}>
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
                                <Dialog
                                    open={isSelfRemovalDialogOpen}
                                    title={
                                        'Dich selbst aus dem Beitrag entfernen'
                                    }
                                >
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
                                </Dialog>
                            </div>
                        </div>
                    </div>
                    {(!isMobile || isEmbedded) && (
                        <div className={styles.editSection}>
                            {showEditSection && (
                                <section>
                                    {showEditSection && (
                                        <div className={styles.buttonSection}>
                                            {User.canEditArticle(
                                                currentUser,
                                                article
                                            ) &&
                                                !disableEdit && (
                                                    <Link
                                                        href={ArticleUtil.getPath(
                                                            article,
                                                            { edit: true }
                                                        )}
                                                        passHref
                                                    >
                                                        <Button
                                                            aria-label="Beitrag bearbeiten"
                                                            style={{
                                                                width: '3em' /* I dont know why this is necessary */,
                                                            }}
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
                                            {User.isAdmin(currentUser) &&
                                                !disablePin && (
                                                    <Button
                                                        aria-label="Beitrag an der Kategorie anpinnen"
                                                        className={clsx(
                                                            styles.pinButton,
                                                            {
                                                                active: article.isPinnedToTop,
                                                            }
                                                        )}
                                                        onClick={() =>
                                                            toggleArticlePin()
                                                        }
                                                        icon={
                                                            <Icon
                                                                icon={
                                                                    faLocationDot
                                                                }
                                                                size={'lg'}
                                                            />
                                                        }
                                                    />
                                                )}
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </Box>
        );
    }
);
ArticlePreviewStandardLayout.displayName = 'ArticlePreviewStandardLayout';
