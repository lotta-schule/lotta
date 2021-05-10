import * as React from 'react';
import {
    Card,
    CardContent,
    TextField,
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
    Divider,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { ButtonGroup } from 'component/general/button/ButtonGroup';
import { DateTimePicker } from '@material-ui/pickers';
import { useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CategorySelect } from './CategorySelect';
import { GroupSelect } from '../../edit/GroupSelect';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import {
    ArrowDropDown as ArrowDropDownIcon,
    FiberManualRecord,
    Warning,
} from '@material-ui/icons';
import { SearchUserField } from '../adminLayout/userManagement/SearchUserField';
import { ArticleModel, ID } from '../../../model';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User, Category } from 'util/model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { DeleteArticleMutation } from 'api/mutation/DeleteArticleMutation';
import { UsersList } from './UsersList';
import { TagsSelect } from './TagsSelect';
import uniqBy from 'lodash/uniqBy';
import clsx from 'clsx';
import Img from 'react-cloudimage-responsive';

const useStyles = makeStyles((theme) => ({
    root: {
        borderRadius: '0',
        overflow: 'auto',
    },
    saveButton: {
        marginBottom: theme.spacing(1),
    },
    cancelButton: {
        borderColor: theme.palette.secondary.main,
        color: theme.palette.secondary.main,
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

interface EditArticleSidebarProps {
    article: ArticleModel;
    isLoading?: boolean;
    onUpdate(article: ArticleModel): void;
    onSave(additionalProps?: Partial<ArticleModel>): void;
}

export const EditArticleSidebar = React.memo<EditArticleSidebarProps>(
    ({ article, isLoading, onUpdate, onSave }) => {
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
            <Card className={styles.root} data-testid="EditArticleSidebar">
                <CardContent>
                    <Typography variant="h6" align="center">
                        Beitrags-Einstellungen
                    </Typography>
                </CardContent>
                <CardContent>
                    <TextField
                        label={'Titel des Beitrags'}
                        placeholder={'Placeholder'}
                        value={article.title}
                        onChange={(e) =>
                            onUpdate({ ...article, title: e.target.value })
                        }
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            'aria-label': 'Titel des Beitrags',
                        }}
                    />
                </CardContent>
                <CardContent>
                    <TextField
                        label={'Vorschautext'}
                        placeholder="Füge hier einen kurzen Vorschautext ein"
                        value={article.preview || ''}
                        onChange={(e) =>
                            onUpdate({ ...article, preview: e.target.value })
                        }
                        fullWidth
                        variant="outlined"
                        multiline
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            'aria-label': 'Vorschautext',
                        }}
                    />
                </CardContent>
                <CardContent>
                    <DateTimePicker
                        fullWidth
                        label="Datum"
                        inputVariant="outlined"
                        format={'PPP'}
                        ampm={false}
                        disableFuture={true}
                        animateYearScrolling={true}
                        value={new Date(article.insertedAt)}
                        onChange={(date) =>
                            date &&
                            onUpdate({
                                ...article,
                                insertedAt: date.toISOString(),
                            })
                        }
                    />
                </CardContent>
                <CardContent>
                    <CategorySelect
                        selectedCategory={article.category || null}
                        onSelectCategory={(category) =>
                            onUpdate({ ...article, category })
                        }
                    />
                </CardContent>
                {User.isAdmin(currentUser) && (
                    <CardContent>
                        <TagsSelect
                            value={article.tags || []}
                            onChange={(tags) => {
                                onUpdate({ ...article, tags });
                            }}
                        />
                    </CardContent>
                )}
                <CardContent>
                    <SelectFileOverlay
                        allowDeletion
                        label={'Vorschaubild ändern'}
                        onSelectFile={(previewImageFile) =>
                            onUpdate({ ...article, previewImageFile })
                        }
                    >
                        {article.previewImageFile ? (
                            <Img
                                operation={'width'}
                                size={'300x200'}
                                src={article.previewImageFile.remoteLocation}
                            />
                        ) : (
                            <PlaceholderImage width={'100%'} height={150} />
                        )}
                    </SelectFileOverlay>
                </CardContent>
                <CardContent>
                    {User.isAdmin(currentUser) && (
                        <SearchUserField
                            className={styles.searchUserField}
                            onSelectUser={(user) => {
                                onUpdate({
                                    ...article,
                                    users: uniqBy(
                                        article.users.concat([user]),
                                        'id'
                                    ),
                                });
                            }}
                        />
                    )}
                    <UsersList
                        users={article.users}
                        onClickRemove={(user) => {
                            if (user.id === currentUser?.id) {
                                setIsSelfRemovalDialogOpen(true);
                            } else {
                                onUpdate({
                                    ...article,
                                    users: article.users.filter(
                                        (articleUser) =>
                                            articleUser.id !== user.id
                                    ),
                                });
                            }
                        }}
                    />
                </CardContent>
                <CardContent>
                    <GroupSelect
                        selectedGroups={article.groups}
                        variant={'outlined'}
                        onSelectGroups={(groups) =>
                            onUpdate({ ...article, groups })
                        }
                    />
                </CardContent>
                {!article.readyToPublish && (
                    <CardContent>
                        <FormControl component={'fieldset'}>
                            <FormLabel component={'legend'}>
                                Gib den Beitrag zur Kontrolle frei, um ihn als
                                'fertig' zu markieren. Ein Verantwortlicher kann
                                ihn dann sichtbar schalten.
                            </FormLabel>
                            <FormControlLabel
                                value={1}
                                control={<Switch color={'secondary'} />}
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
                <CardContent>
                    <FormControl component={'fieldset'}>
                        <FormLabel component={'legend'}>
                            Nur von Administratoren veröffentlichte Beiträge
                            werden auf der Seite angezeigt.
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
                            <div className={styles.isPublishedInformation}>
                                <FiberManualRecord
                                    fontSize={'inherit'}
                                    htmlColor={
                                        article.published ? 'green' : 'red'
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
                                        <>Beitrag ist nicht veröffentlicht</>
                                    )}
                                </Typography>
                            </div>
                        )}
                    </FormControl>
                </CardContent>
                <CardContent>
                    <ButtonGroup className={styles.saveButton} fullWidth>
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
                                setSaveOptionMenuIsOpen(!saveOptionMenuIsOpen)
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
                                        onClickAway={handleCloseSaveOptionsMenu}
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
                                                Ohne Aktualisierszeit zu ändern
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

                    <Button
                        className={styles.cancelButton}
                        onClick={() => history.go(-1)}
                        fullWidth
                    >
                        Abbrechen
                    </Button>

                    <Divider className={styles.deleteButtonDivider} />

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
                    <ResponsiveFullScreenDialog open={isDeleteModalOpen}>
                        <DialogTitle>Beitrag löschen</DialogTitle>
                        <DialogContent>
                            <p>
                                Möchtest du den Beitrag "{article.title}"
                                wirklich löschen?
                            </p>
                            <p>
                                Der Beitrag ist dann unwiederbringbar verloren
                                und kann nicht wiederhergestellt werden.
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
                                Möchtest du dich selbst wirklich aus dem Beitrag
                                "{article.title}" entfernen?
                            </p>
                            <p>
                                Du wirst den Beitrag dann nicht mehr bearbeiten
                                können und übergibst die Rechte den anderen
                                Autoren oder Administratoren der Seite
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
                                    onUpdate({
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
                    </ResponsiveFullScreenDialog>
                </CardContent>
            </Card>
        );
    }
);
