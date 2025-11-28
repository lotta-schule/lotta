'use client';

import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faCaretDown,
  faCalendar,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { useMutation } from '@apollo/client';
import { CategorySelect } from '../../shared/categorySelect/CategorySelect';
import { ArticleModel, ID, UserGroupModel } from 'model';
import { Category, User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ArticleStateEditor } from 'article/editor/ArticleStateEditor';
import { GroupSelect } from 'shared/edit/GroupSelect';
import {
  Button,
  ButtonGroup,
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  MenuButton,
  Item,
  Checkbox,
} from '@lotta-schule/hubert';
import { ArticleDatesEditor } from './ArticleDatesEditor';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import DeleteArticleMutation from 'api/mutation/DeleteArticleMutation.graphql';

import styles from './EditArticleFooter.module.scss';

interface EditArticleFooterProps {
  article: ArticleModel;
  isLoading?: boolean;
  style?: React.CSSProperties;
  onUpdate(article: ArticleModel): void;
  onSave(additionalProps?: Partial<ArticleModel>): void;
}

export const EditArticleFooter = React.memo<EditArticleFooterProps>(
  ({ article, style, isLoading, onUpdate, onSave }) => {
    const currentUser = useCurrentUser();
    const router = useRouter();

    const [isSelfRemovalDialogOpen, setIsSelfRemovalDialogOpen] =
      React.useState(false);
    const [isDatesEditorOpen, setIsDatesEditorOpen] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

    const [deleteArticle] = useMutation<{ article: ArticleModel }, { id: ID }>(
      DeleteArticleMutation,
      {
        variables: {
          id: article.id,
        },
        onCompleted: () => {
          if (article.category) {
            router.push(Category.getPath(article.category));
          } else {
            router.push('/');
          }
        },
      }
    );

    return (
      <Box
        style={style}
        className={styles.root}
        data-testid="EditArticleFooter"
      >
        <h5>Beitrags-Einstellungen</h5>
        <div className={styles.container}>
          <div className={styles.gridItem}>
            <h6>Sichtbarkeit</h6>
            <div>
              <React.Suspense fallback={null}>
                <GroupSelect
                  label={undefined}
                  aria-label={'Gruppenauswahl'}
                  selectedGroups={article.groups}
                  onSelectGroups={(groups: UserGroupModel[]) =>
                    onUpdate({ ...article, groups })
                  }
                />
              </React.Suspense>
            </div>
            <div className={styles.buttonWrapper}>
              <Button
                className={styles.deleteButton}
                onClick={() => setIsDeleteModalOpen(true)}
                variant={'error'}
                icon={
                  <Icon
                    icon={faTriangleExclamation}
                    className={clsx(styles.leftIcon, styles.iconSmall)}
                  />
                }
              >
                Beitrag löschen
              </Button>
            </div>
          </div>
          <div className={styles.gridItem}>
            <h6>Veröffentlichung</h6>
            <ArticleStateEditor article={article} onUpdate={onUpdate} />
            <div className={styles.buttonWrapper}>
              <Button
                className={styles.cancelButton}
                onClick={() => router.back()}
              >
                abbrechen
              </Button>
              {User.isAdmin(currentUser) && (
                <>
                  <Button
                    className={styles.cancelButton}
                    onClick={() => setIsDatesEditorOpen(true)}
                    title={'Daten bearbeiten'}
                    aria-label={'Edit dates'}
                  >
                    <Icon icon={faCalendar} />
                  </Button>
                  <ArticleDatesEditor
                    isOpen={isDatesEditorOpen}
                    article={article}
                    onUpdate={({ insertedAt }) => {
                      onUpdate({
                        ...article,
                        insertedAt,
                      });
                      setIsDatesEditorOpen(false);
                    }}
                    onAbort={() => setIsDatesEditorOpen(false)}
                  />
                </>
              )}
            </div>
          </div>
          <div className={styles.gridItem}>
            <h6>Kategorie zuordnen</h6>
            <div>
              <CategorySelect
                selectedCategory={article.category || null}
                onSelectCategory={(category) =>
                  onUpdate({ ...article, category })
                }
              />
            </div>
            <h6>Reaktionen auf Beitrag</h6>
            <div>
              <Checkbox
                isSelected={article.isReactionsEnabled ?? false}
                onChange={(isReactionsEnabled) =>
                  onUpdate({ ...article, isReactionsEnabled })
                }
              >
                zulassen
              </Checkbox>
            </div>
            <div />
            <ButtonGroup fullWidth>
              <MenuButton
                title={'Speicheroptionen'}
                buttonProps={{
                  className: 'is-first-button-group-button',
                  variant: 'fill',
                  children: <Icon icon={faCaretDown} />,
                }}
                placement={'top'}
                onAction={(action) => {
                  switch (action) {
                    case 'save-no-pudated-at':
                      return onSave({
                        updatedAt: new Date(article.updatedAt).toISOString(),
                      });
                    case 'save-updated-on-created':
                      return onSave({
                        updatedAt: article.insertedAt,
                      });
                  }
                }}
              >
                <Item key={'save-no-updated-at'}>
                  Ohne Aktualisierszeit zu ändern
                </Item>
                <Item key={'save-updated-on-created'}>
                  Aktualisierszeit auf Erstellszeit setzen
                </Item>
              </MenuButton>
              <Button
                fullWidth
                className={'is-last-button-group-button'}
                variant={'fill'}
                disabled={isLoading}
                onClick={() => onSave()}
              >
                speichern
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <Dialog
          open={isDeleteModalOpen}
          title={'Beitrag löschen'}
          onRequestClose={() => setIsDeleteModalOpen(false)}
        >
          <DialogContent>
            <p>Möchtest du den Beitrag "{article.title}" wirklich löschen?</p>
            <p>
              Der Beitrag ist dann unwiederbringbar verloren und kann nicht
              wiederhergestellt werden.
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteModalOpen(false)}>
              Beitrag behalten
            </Button>
            <Button variant={'error'} onClick={() => deleteArticle()}>
              Beitrag endgültig löschen
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={isSelfRemovalDialogOpen}
          title={'Dich selbst aus dem Beitrag entfernen'}
          onRequestClose={() => setIsSelfRemovalDialogOpen(false)}
        >
          <DialogContent>
            <p>
              Möchtest du dich selbst wirklich aus dem Beitrag "{article.title}"
              entfernen?
            </p>
            <p>
              Du wirst den Beitrag dann nicht mehr bearbeiten können und
              übergibst die Rechte den anderen Autoren oder Administratoren der
              Seite
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsSelfRemovalDialogOpen(false)}>
              abbrechen
            </Button>
            <Button
              onClick={() => {
                onUpdate({
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
      </Box>
    );
  }
);
EditArticleFooter.displayName = 'EditArticleFooter';
