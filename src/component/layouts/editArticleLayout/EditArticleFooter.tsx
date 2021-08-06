import * as React from 'react';
import {
    Card,
    CardContent,
    makeStyles,
    Typography,
    FormControl,
    FormLabel,
    FormControlLabel,
    Switch,
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
import { useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CategorySelect } from './CategorySelect';
import { GroupSelect } from '../../edit/GroupSelect';
import {
    ArrowDropDown as ArrowDropDownIcon,
    FiberManualRecord,
    Warning,
} from '@material-ui/icons';
import { ArticleModel, ID } from 'model';
import { Category, User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { DeleteArticleMutation } from 'api/mutation/DeleteArticleMutation';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: '0',
        overflow: 'auto',
        padding: theme.spacing(1),
    },
    gridItem: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '& > :nth-child(2)': {
            flexGrow: 1,
            padding: theme.spacing(1, 0),
        },
    },
    buttonWrapper: {
        display: 'flex',
        alignItems: 'baseline',
    },
    cancelButton: {
        borderColor: theme.palette.secondary.main,
        color: theme.palette.secondary.main,
        marginRight: theme.spacing(1),
    },
    deleteButtonDivider: {
        marginTop: theme.spacing(1),
    },
    deleteButton: {
        color: theme.palette.error.contrastText,
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.main,
        marginTop: theme.spacing(2),
        '& hover': {
            backgroundColor: [theme.palette.error.main, 0.8],
        },
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
    searchUserField: {
        border: `1px solid ${theme.palette.divider}`,
    },
    isPublishedInformation: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
    },
    popper: {
        zIndex: 1,
    },
}));

interface EditArticleFooterProps {
    article: ArticleModel;
    isLoading?: boolean;
    style?: React.CSSProperties;
    onUpdate(article: ArticleModel): void;
    onSave(additionalProps?: Partial<ArticleModel>): void;
}

export const EditArticleFooter = React.memo<EditArticleFooterProps>(
    ({ article, style, isLoading, onUpdate, onSave }) => {
        const styles = useStyles();
        const currentUser = useCurrentUser();
        const history = useHistory();

        const [isReadyToPublish, setIsReadyToPublish] = React.useState(
            article.readyToPublish || false
        );
        const [isPublished, setIsPublished] = React.useState(
            article.published || false
        );
        const [
            isSelfRemovalDialogOpen,
            setIsSelfRemovalDialogOpen,
        ] = React.useState(false);
        const [saveOptionMenuIsOpen, setSaveOptionMenuIsOpen] = React.useState(
            false
        );
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
                    history.push(Category.getPath(article.category));
                } else {
                    history.push('/');
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
                    <Typography variant="h5">Beitrags-Einstellungen</Typography>
                </CardContent>
                <Grid container>
                    <Grid item md={4} className={styles.gridItem}>
                        <Typography variant={'h6'}>Sichtbarkeit</Typography>
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
                                fullWidth
                            >
                                Beitrag löschen
                            </Button>
                        </div>
                    </Grid>
                    <Grid item md={4} className={styles.gridItem}>
                        <Typography variant={'h6'}>
                            Kategorie zuordnen
                        </Typography>
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
                        <Typography variant={'h6'}>Veröffentlichung</Typography>
                        <div>
                            {!article.readyToPublish && (
                                <CardContent>
                                    <FormControl component={'fieldset'}>
                                        <FormLabel component={'legend'}>
                                            Gib den Beitrag zur Kontrolle frei,
                                            um ihn als 'fertig' zu markieren.
                                            Ein Verantwortlicher kann ihn dann
                                            sichtbar schalten.
                                        </FormLabel>
                                        <FormControlLabel
                                            value={1}
                                            control={
                                                <Switch color={'secondary'} />
                                            }
                                            onChange={(_, checked) =>
                                                setIsReadyToPublish(checked)
                                            }
                                            label={
                                                isReadyToPublish
                                                    ? 'Beitrag wird zur Kontrolle freigegeben'
                                                    : 'Zur Kontrolle freigeben'
                                            }
                                            labelPlacement={'end'}
                                        />
                                    </FormControl>
                                </CardContent>
                            )}
                            <FormControl component={'fieldset'}>
                                <FormLabel component={'legend'}>
                                    Nur von Administratoren veröffentlichte
                                    Beiträge werden auf der Seite angezeigt.
                                </FormLabel>
                                {User.isAdmin(currentUser) && (
                                    <FormControlLabel
                                        value={1}
                                        disabled={!User.isAdmin(currentUser)}
                                        control={<Switch color={'secondary'} />}
                                        checked={isPublished}
                                        onChange={(_, checked) =>
                                            setIsPublished(checked)
                                        }
                                        label={
                                            article.published
                                                ? isPublished
                                                    ? 'Beitrag ist veröffentlicht.'
                                                    : 'Veröffentlichung wird zurückgenommen.'
                                                : isPublished
                                                ? 'Beitrag wird veröffentlicht.'
                                                : 'Beitrag veröffentlichen'
                                        }
                                        labelPlacement={'end'}
                                    />
                                )}
                                {!User.isAdmin(currentUser) && (
                                    <div
                                        className={
                                            styles.isPublishedInformation
                                        }
                                    >
                                        <FiberManualRecord
                                            fontSize={'inherit'}
                                            htmlColor={
                                                article.published
                                                    ? 'green'
                                                    : 'red'
                                            }
                                        />
                                        <Typography
                                            variant={'body1'}
                                            component={'span'}
                                        >
                                            {article.published && (
                                                <>Beitrag ist veröffentlicht</>
                                            )}
                                            {!article.published && (
                                                <>
                                                    Beitrag ist nicht
                                                    veröffentlicht
                                                </>
                                            )}
                                        </Typography>
                                    </div>
                                )}
                            </FormControl>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <Button
                                className={styles.cancelButton}
                                onClick={() => history.back()}
                            >
                                abbrechen
                            </Button>
                            <ButtonGroup fullWidth>
                                <Button
                                    fullWidth
                                    variant={'fill'}
                                    disabled={isLoading}
                                    onClick={() =>
                                        onSave({
                                            readyToPublish: isReadyToPublish,
                                            published: isPublished,
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
                                                                readyToPublish: isReadyToPublish,
                                                                published: isPublished,
                                                                updatedAt: new Date(
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
                                                                readyToPublish: isReadyToPublish,
                                                                published: isPublished,
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
                        <Button
                            color={'secondary'}
                            onClick={() => deleteArticle()}
                        >
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
                            color={'secondary'}
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
