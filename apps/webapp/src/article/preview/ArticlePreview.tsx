'use client';

import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faCircle,
  faLocationDot,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { format, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArticleModel, ID, UserModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, User } from 'util/model';
import { useMutation } from '@apollo/client/react';
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
import { TagsSelect } from '../editor/TagsSelect';
import { AuthorAvatarsList } from 'article/authorAvatarsList/AuthorAvatarsList';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { TagDetailsDialog } from 'article/tagDetailsDialog';
import { UserArticlesDialog } from 'profile/userArticlesDialog';
import Link from 'next/link';
import clsx from 'clsx';

import ToggleArticlePinMutation from 'api/mutation/ToggleArticlePin.graphql';

import styles from './ArticlePreview.module.scss';

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
    const currentUser = useCurrentUser();

    const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
    const [selectedUser, setSelectedUser] = React.useState<UserModel | null>(
      null
    );

    const selectedUsers = React.useMemo(
      () =>
        selectedUser && [
          selectedUser,
          ...article.users.filter(({ id }) => id !== selectedUser?.id),
        ],
      [selectedUser, article]
    );

    const showEditSection =
      User.canEditArticle(currentUser, article) || User.isAdmin(currentUser);

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
        <Link
          href={Article.getPath(article)}
          color={'inherit'}
          style={{ textDecoration: 'none' }}
          className={styles.link}
        >
          {content ?? ''}
        </Link>
      );

    return (
      <>
        <Box
          className={clsx(styles.root, {
            [styles.twoColumns]: layout === '2-columns',
            [styles.densed]: layout === 'densed',
            [styles.isEmbedded]: isEmbedded,
            [styles.emptyDescriptionText]: !onUpdateArticle && !article.preview,
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
                  description={'[opt. Größe 1200x800]'}
                  onSelectFile={(previewImageFile) =>
                    onUpdateArticle({
                      ...article,
                      previewImageFile,
                    })
                  }
                >
                  {
                    <ResponsiveImage
                      lazy
                      animateOnLoad
                      sizes="auto"
                      className={styles.previewImage}
                      file={article?.previewImageFile ?? undefined}
                      format="articlepreview"
                      alt={`Vorschaubild zu ${article.title}`}
                      fallback={
                        <PlaceholderImage aspectRatio={3 / 2} width={'100%'} />
                      }
                    />
                  }
                </SelectFileOverlay>
              )}
              {!onUpdateArticle &&
                maybeLinked(
                  <ResponsiveImage
                    className={styles.previewImage}
                    file={article.previewImageFile ?? undefined}
                    format="articlepreview"
                    lazy
                    animateOnLoad
                    sizes="auto"
                    alt={`Vorschaubild zu ${article.title}`}
                  />
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
                      title: (e.target as HTMLInputElement).value,
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
                  {!isEmbedded &&
                    currentUser?.lastSeen &&
                    isBefore(
                      new Date(currentUser.lastSeen),
                      new Date(article.updatedAt)
                    ) && (
                      <span data-testid={'updated-dot'} role={'presentation'}>
                        <Icon
                          icon={faCircle}
                          fontSize={'inherit'}
                          className={styles.hasUpdateDot}
                        />
                      </span>
                    )}
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
                      preview: (e.target as HTMLInputElement).value,
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
            {layout !== '2-columns' && (
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
                    <Tag key={tag} onClick={() => setSelectedTag(tag)}>
                      {tag}
                    </Tag>
                  ))}
              </div>
            )}
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
                max={onUpdateArticle ? Infinity : undefined}
                users={article.users}
                className={styles.authorAvatarsList}
                onUpdate={
                  onUpdateArticle
                    ? (users) => {
                        if (
                          users.length === article.users.length - 1 &&
                          article.users.find((u) => u.id === currentUser!.id) &&
                          !users.find((u) => u.id === currentUser!.id)
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
                onClick={setSelectedUser}
              />
              <Dialog
                open={isSelfRemovalDialogOpen}
                title={'Dich selbst aus dem Beitrag entfernen'}
              >
                <DialogContent>
                  <p>
                    Möchtest du dich selbst wirklich aus dem Beitrag "
                    {article.title}" entfernen?
                  </p>
                  <p>
                    Du wirst den Beitrag dann nicht mehr bearbeiten können und
                    übergibst die Rechte den anderen Autoren oder
                    Administratoren der Seite
                  </p>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setIsSelfRemovalDialogOpen(false)}>
                    abbrechen
                  </Button>
                  <Button
                    color={'secondary'}
                    onClick={() => {
                      onUpdateArticle!({
                        ...article,
                        users: article.users.filter(
                          (articleUser) => articleUser.id !== currentUser?.id
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
                        legacyBehavior
                      >
                        <Button
                          aria-label="Beitrag bearbeiten"
                          className={clsx(styles.editButton, 'edit-button')}
                          icon={<Icon icon={faPen} size={'lg'} />}
                        />
                      </Link>
                    )}
                  {User.isAdmin(currentUser) && !disablePin && (
                    <Button
                      aria-label="Beitrag an der Kategorie anpinnen"
                      className={clsx(styles.pinButton, {
                        [styles.active]: article.isPinnedToTop,
                      })}
                      onClick={() => toggleArticlePin()}
                      icon={<Icon icon={faLocationDot} size={'lg'} />}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </Box>
        {layout !== '2-columns' && selectedTag && (
          <TagDetailsDialog
            tag={selectedTag}
            onRequestClose={() => setSelectedTag(null)}
          />
        )}
        {selectedUsers && (
          <UserArticlesDialog
            users={selectedUsers}
            onRequestClose={() => setSelectedUser(null)}
          />
        )}
      </>
    );
  }
);
ArticlePreview.displayName = 'ArticlePreview';
