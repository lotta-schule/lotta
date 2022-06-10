import * as React from 'react';
import { Box } from 'shared/general/layout/Box';
import {
    ArrowDropDown as ArrowDropDownIcon,
    Event,
    Warning,
} from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { CategorySelect } from '../../shared/categorySelect/CategorySelect';
import { ArticleModel, ID } from 'model';
import { Category, User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ArticleStateEditor } from 'article/editor/ArticleStateEditor';
import { Button } from 'shared/general/button/Button';
import { ButtonGroup } from 'shared/general/button/ButtonGroup';
import { GroupSelect } from 'shared/edit/GroupSelect';
import {
    Dialog,
    DialogContent,
    DialogActions,
} from 'shared/general/dialog/Dialog';
import { ArticleDatesEditor } from './ArticleDatesEditor';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import DeleteArticleMutation from 'api/mutation/DeleteArticleMutation.graphql';

import styles from './EditArticleFooter.module.scss';
import { Menu, MenuItem, MenuList } from 'shared/general/menu';

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

        const [deleteArticle] = useMutation<
            { article: ArticleModel },
            { id: ID }
        >(DeleteArticleMutation, {
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
        });

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
                            <GroupSelect
                                label={null}
                                selectedGroups={article.groups}
                                variant={'outlined'}
                                onSelectGroups={(groups) =>
                                    onUpdate({ ...article, groups })
                                }
                            />
                        </div>
                        <div className={styles.buttonWrapper}>
                            <Button
                                className={styles.deleteButton}
                                onClick={() => setIsDeleteModalOpen(true)}
                                variant={'error'}
                                icon={
                                    <Warning
                                        className={clsx(
                                            styles.leftIcon,
                                            styles.iconSmall
                                        )}
                                    />
                                }
                            >
                                Beitrag löschen
                            </Button>
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
                        <div />
                    </div>
                    <div className={styles.gridItem}>
                        <h6>Veröffentlichung</h6>
                        <ArticleStateEditor
                            article={article}
                            onUpdate={onUpdate}
                        />
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
                                        onClick={() =>
                                            setIsDatesEditorOpen(true)
                                        }
                                        title={'Daten bearbeiten'}
                                        aria-label={'Edit dates'}
                                    >
                                        <Event />
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
                                        onAbort={() =>
                                            setIsDatesEditorOpen(false)
                                        }
                                    />
                                </>
                            )}
                            <ButtonGroup fullWidth>
                                <Button
                                    fullWidth
                                    className={'is-first-button-group-button'}
                                    variant={'fill'}
                                    disabled={isLoading}
                                    onClick={() =>
                                        onSave({
                                            updatedAt: new Date().toISOString(),
                                        })
                                    }
                                >
                                    speichern
                                </Button>
                                <Menu
                                    buttonProps={{
                                        icon: <ArrowDropDownIcon />,
                                        className:
                                            'is-last-button-group-button',
                                        variant: 'fill',
                                    }}
                                >
                                    <MenuList>
                                        <MenuItem
                                            onClick={() =>
                                                onSave({
                                                    updatedAt: new Date(
                                                        article.updatedAt
                                                    ).toISOString(),
                                                })
                                            }
                                        >
                                            Ohne Aktualisierszeit zu ändern
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() =>
                                                onSave({
                                                    updatedAt:
                                                        article.insertedAt,
                                                })
                                            }
                                        >
                                            Aktualisierszeit auf Erstellszeit
                                            setzen
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
                <Dialog
                    open={isDeleteModalOpen}
                    title={'Beitrag löschen'}
                    onRequestClose={() => setIsDeleteModalOpen(false)}
                >
                    <DialogContent>
                        <p>
                            Möchtest du den Beitrag "{article.title}" wirklich
                            löschen?
                        </p>
                        <p>
                            Der Beitrag ist dann unwiederbringbar verloren und
                            kann nicht wiederhergestellt werden.
                        </p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDeleteModalOpen(false)}>
                            Beitrag behalten
                        </Button>
                        <Button
                            variant={'error'}
                            onClick={() => deleteArticle()}
                        >
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
                            Möchtest du dich selbst wirklich aus dem Beitrag "
                            {article.title}" entfernen?
                        </p>
                        <p>
                            Du wirst den Beitrag dann nicht mehr bearbeiten
                            können und übergibst die Rechte den anderen Autoren
                            oder Administratoren der Seite
                        </p>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setIsSelfRemovalDialogOpen(false)}
                        >
                            abbrechen
                        </Button>
                        <Button
                            onClick={() => {
                                onUpdate({
                                    ...article,
                                    users: article.users.filter(
                                        (articleUser) =>
                                            articleUser.id !== currentUser?.id
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
