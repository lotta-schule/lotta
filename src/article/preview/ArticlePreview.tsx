import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faLocationDot, faPen } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, File, User } from 'util/model';
import { useMutation } from '@apollo/client';
import { Article as ArticleUtil } from 'util/model/Article';
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
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import Link from 'next/link';
import getConfig from 'next/config';
import clsx from 'clsx';

import ToggleArticlePinMutation from 'api/mutation/ToggleArticlePin.graphql';

import styles from './ArticlePreview.module.scss';

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
    layout?: 'standard' | 'densed' | '2-columns';
}

export const ArticlePreview = React.memo(
    ({
        article,
        disableLink,
        disableEdit,
        disablePin,
        isEmbedded,
        layout,
        onUpdateArticle,
    }: ArticlePreviewProps) => {
        const { baseUrl } = useServerData();

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
                    [styles.twoColumns]: layout === '2-columns',
                    [styles.densed]: layout === 'densed',
                    [styles.isEmbedded]: isEmbedded,
                    [styles.emptyDescriptionText]:
                        !onUpdateArticle && !article.preview,
                })}
                data-testid="ArticlePreview"
            >
                <div className={styles.containerGrid}>
                    <div className={styles.imageGridItem}>
                        {!!onUpdateArticle && (
                            <SelectFileOverlay
                                allowDeletion
                                style={{ width: '100%' }}
                                label={'Vorschaubild ändern'}
                                description={'[opt. Größe 1200 x 800 px]'}
                                onSelectFile={(previewImageFile) =>
                                    onUpdateArticle({
                                        ...article,
                                        previewImageFile,
                                    })
                                }
                            >
                                {article.previewImageFile ? (
                                    <ResponsiveImage
                                        className={styles.previewImage}
                                        width={400}
                                        aspectRatio={'3:2'}
                                        src={File.getFileRemoteLocation(
                                            baseUrl,
                                            article.previewImageFile
                                        )}
                                        alt={`Vorschaubild zu ${article.title}`}
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
                                    <ResponsiveImage
                                        className={styles.previewImage}
                                        width={400}
                                        aspectRatio={'3:2'}
                                        src={File.getFileRemoteLocation(
                                            baseUrl,
                                            article.previewImageFile
                                        )}
                                        alt={`Vorschaubild zu ${article.title}`}
                                    />
                                )
                            )}
                    </div>
                    <div className={styles.titleGridItem}>
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
                    </div>
                    <div className={styles.previewGridItem}>
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
                    </div>
                    <div className={styles.tagsGridItem}>
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
                    </div>
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
                    <div className={styles.authorsGridItem}>
                        <AuthorAvatarsList
                            max={!!onUpdateArticle ? Infinity : undefined}
                            users={article.users}
                            className={styles.authorAvatarsList}
                            onUpdate={
                                !!onUpdateArticle
                                    ? (users) => {
                                          if (
                                              users.length ===
                                                  article.users.length - 1 &&
                                              article.users.find(
                                                  (u) =>
                                                      u.id === currentUser!.id
                                              ) &&
                                              !users.find(
                                                  (u) =>
                                                      u.id === currentUser!.id
                                              )
                                          ) {
                                              setIsSelfRemovalDialogOpen(true);
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
                            title={'Dich selbst aus dem Beitrag entfernen'}
                        >
                            <DialogContent>
                                <p>
                                    Möchtest du dich selbst wirklich aus dem
                                    Beitrag "{article.title}" entfernen?
                                </p>
                                <p>
                                    Du wirst den Beitrag dann nicht mehr
                                    bearbeiten können und übergibst die Rechte
                                    den anderen Autoren oder Administratoren der
                                    Seite
                                </p>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={() =>
                                        setIsSelfRemovalDialogOpen(false)
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
                                        setIsSelfRemovalDialogOpen(false);
                                    }}
                                >
                                    endgültig entfernen
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                    <div className={styles.editGridItem}>
                        {showEditSection && (
                            <div className={styles.buttonSection}>
                                {User.canEditArticle(currentUser, article) &&
                                    !disableEdit && (
                                        <Link
                                            href={ArticleUtil.getPath(article, {
                                                edit: true,
                                            })}
                                            passHref
                                        >
                                            <Button
                                                aria-label="Beitrag bearbeiten"
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
                                {User.isAdmin(currentUser) && !disablePin && (
                                    <Button
                                        aria-label="Beitrag an der Kategorie anpinnen"
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
                    </div>
                </div>
            </Box>
        );
    }
);
ArticlePreview.displayName = 'ArticlePreview';
