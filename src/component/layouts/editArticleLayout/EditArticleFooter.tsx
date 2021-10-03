import * as React from 'react';
import {
    Card,
    CardContent,
    Popper,
    Grow,
    Paper,
    ClickAwayListener,
    MenuList,
    MenuItem,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { ButtonGroup } from 'component/general/button/ButtonGroup';
import { useMutation } from '@apollo/client';
import { CategorySelect } from './CategorySelect';
import { GroupSelect } from '../../edit/GroupSelect';
import {
    ArrowDropDown as ArrowDropDownIcon,
    Event,
    Warning,
} from '@material-ui/icons';
import { ArticleModel, ID } from 'model';
import { Category, User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ArticleStateEditor } from 'component/article/ArticleStateEditor';
import { ArticleDatesEditor } from './ArticleDatesEditor';
import { useRouter } from 'next/router';
import DeleteArticleMutation from 'api/mutation/DeleteArticleMutation.graphql';
import clsx from 'clsx';

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
        const [saveOptionMenuIsOpen, setSaveOptionMenuIsOpen] =
            React.useState(false);
        const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
        const saveOptionsMenuAnchorRef = React.useRef<HTMLButtonElement>(null);

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

        const handleCloseSaveOptionsMenu = (
            event: React.MouseEvent<Document>
        ): void => {
            if (
                saveOptionsMenuAnchorRef.current &&
                saveOptionsMenuAnchorRef.current.contains(event.target as Node)
            ) {
                return;
            }

            setSaveOptionMenuIsOpen(false);
        };

        return (
            <Card
                style={style}
                className={styles.root}
                data-testid="EditArticleFooter"
            >
                <CardContent>
                    <h5>Beitrags-Einstellungen</h5>
                </CardContent>
                <Grid container>
                    <Grid item md={4} className={styles.gridItem}>
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
                    </Grid>
                    <Grid item md={4} className={styles.gridItem}>
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
                    </Grid>
                    <Grid item md={4} className={styles.gridItem}>
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
                                <Button
                                    ref={saveOptionsMenuAnchorRef}
                                    aria-owns={
                                        saveOptionMenuIsOpen
                                            ? 'menu-list-grow'
                                            : undefined
                                    }
                                    aria-haspopup="true"
                                    style={{ width: 'auto' }}
                                    variant={'fill'}
                                    icon={<ArrowDropDownIcon />}
                                    onClick={() =>
                                        setSaveOptionMenuIsOpen(
                                            !saveOptionMenuIsOpen
                                        )
                                    }
                                ></Button>
                            </ButtonGroup>
                            <Popper
                                transition
                                open={saveOptionMenuIsOpen}
                                anchorEl={saveOptionsMenuAnchorRef.current}
                                className={styles.popper}
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        style={{
                                            transformOrigin:
                                                placement === 'bottom'
                                                    ? 'top right'
                                                    : 'bottom right',
                                        }}
                                    >
                                        <Paper id="menu-list-grow">
                                            <ClickAwayListener
                                                onClickAway={
                                                    handleCloseSaveOptionsMenu
                                                }
                                            >
                                                <MenuList>
                                                    <MenuItem
                                                        onClick={() =>
                                                            onSave({
                                                                updatedAt:
                                                                    new Date(
                                                                        article.updatedAt
                                                                    ).toISOString(),
                                                            })
                                                        }
                                                    >
                                                        Ohne Aktualisierszeit zu
                                                        ändern
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() =>
                                                            onSave({
                                                                updatedAt:
                                                                    article.insertedAt,
                                                            })
                                                        }
                                                    >
                                                        Aktualisierszeit auf
                                                        Erstellszeit setzen
                                                    </MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </div>
                    </Grid>
                </Grid>
                <ResponsiveFullScreenDialog open={isDeleteModalOpen}>
                    <DialogTitle>Beitrag löschen</DialogTitle>
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
                            abbrechen
                        </Button>
                        <Button onClick={() => deleteArticle()}>
                            endgültig löschen
                        </Button>
                    </DialogActions>
                </ResponsiveFullScreenDialog>
                <ResponsiveFullScreenDialog open={isSelfRemovalDialogOpen}>
                    <DialogTitle>
                        Dich selbst aus dem Beitrag entfernen
                    </DialogTitle>
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
                </ResponsiveFullScreenDialog>
            </Card>
        );
    }
);
EditArticleFooter.displayName = 'EditArticleFooter';
