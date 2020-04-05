import React, { memo, useState, useRef, MouseEvent } from 'react';
import {
    Card, CardContent, TextField, Button, makeStyles, Typography, FormControl, FormLabel, FormControlLabel,
    Switch, ButtonGroup, Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem, Divider, DialogTitle, DialogContent, DialogActions
} from '@material-ui/core';
import { DateTimePicker } from '@material-ui/pickers';
import { uniqBy } from 'lodash';
import { useMutation } from '@apollo/react-hooks';
import { CategorySelect } from './CategorySelect';
import { GroupSelect } from '../../edit/GroupSelect';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { ArrowDropDown as ArrowDropDownIcon, Warning } from '@material-ui/icons';
import { SearchUserField } from '../adminLayout/userManagement/SearchUserField';
import { ArticleModel, ID } from '../../../model';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User, Category } from 'util/model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { DeleteArticleMutation } from 'api/mutation/UpdateArticleMutation copy';
import { UsersList } from './UsersList';
import { SelectTopicAutocomplete } from './SelectTopicAutocomplete';
import { SaveButton } from 'component/general/SaveButton';
import clsx from 'clsx';
import Img from 'react-cloudimage-responsive';
import useRouter from 'use-react-router';

const useStyles = makeStyles(theme => ({
    root: {
        borderRadius: '0',
        overflow: 'auto'
    },
    button: {
        marginBottom: theme.spacing(1),
    },
    deleteButtonDivider: {
        marginTop: theme.spacing(1),
    },
    deleteButton: {
        color: theme.palette.error.contrastText,
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.main,
        marginTop: theme.spacing(2)
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
    searchUserField: {
        border: `1px solid ${theme.palette.divider}`
    },
    popper: {
        zIndex: 1
    }
}));

interface EditArticleSidebarProps {
    article: ArticleModel;
    isLoading?: boolean;
    onUpdate(article: ArticleModel): void;
    onSave(additionalProps?: Partial<ArticleModel>): void;
}

export const EditArticleSidebar = memo<EditArticleSidebarProps>(({ article, isLoading, onUpdate, onSave }) => {
    const styles = useStyles();
    const [currentUser] = useCurrentUser();
    const { history } = useRouter();

    const [isReadyToPublish, setIsReadyToPublish] = useState(article.readyToPublish || false);
    const [saveOptionMenuIsOpen, setSaveOptionMenuIsOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const saveOptionsMenuAnchorRef = useRef<HTMLDivElement | null>(null);

    const [deleteArticle] = useMutation<{ article: ArticleModel }, { id: ID }>(DeleteArticleMutation, {
        variables: {
            id: article.id
        },
        onCompleted: () => {
            if (article.category) {
                history.push(Category.getPath(article.category));
            } else {
                history.push('/');
            }
        }
    });

    const handleCloseSaveOptionsMenu = (event: MouseEvent<Document>): void => {
        if (saveOptionsMenuAnchorRef.current && saveOptionsMenuAnchorRef.current.contains(event.target as Node)) {
            return;
        }

        setSaveOptionMenuIsOpen(false);
    }

    return (
        <Card className={styles.root}>
            <CardContent>
                <Typography variant="h6" align="center">
                    Beitrags-Einstellungen
                </Typography>
            </CardContent>
            <CardContent>
                <TextField
                    label="Titel des Beitrags"
                    placeholder="Placeholder"
                    value={article.title}
                    onChange={e => onUpdate({ ...article, title: e.target.value })}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </CardContent>
            <CardContent>
                <TextField
                    label="Vorschautext"
                    placeholder="Füge hier einen kurzen Vorschautext ein"
                    value={article.preview || ''}
                    onChange={e => onUpdate({ ...article, preview: e.target.value })}
                    fullWidth
                    variant="outlined"
                    multiline
                    InputLabelProps={{
                        shrink: true,
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
                    onChange={date => date && onUpdate({ ...article, insertedAt: date.toISOString() })}
                />
            </CardContent>
            {User.isAdmin(currentUser) && (
                <>
                    <CardContent>
                        <CategorySelect
                            selectedCategory={article.category || null}
                            onSelectCategory={category => onUpdate({ ...article, category })}
                        />
                    </CardContent>
                    <CardContent>
                        <SelectTopicAutocomplete
                            value={article.topic ?? ''}
                            onChange={topic => onUpdate({ ...article, topic })}
                        />
                    </CardContent>
                </>
            )}
            <CardContent>
                <SelectFileOverlay allowDeletion label={'Vorschaubild ändern'} onSelectFile={previewImageFile => onUpdate({ ...article, previewImageFile })}>
                    {article.previewImageFile ? (
                        <Img operation={'width'} size={'300x200'} src={article.previewImageFile.remoteLocation} />
                    ) : <PlaceholderImage width={'100%'} height={150} />}
                </SelectFileOverlay>
            </CardContent>
            <CardContent>
                {User.isAdmin(currentUser) && (
                    <SearchUserField
                        className={styles.searchUserField}
                        onSelectUser={user => {
                            onUpdate({ ...article, users: uniqBy(article.users.concat([user]), 'id') })
                        }}
                    />
                )}
                <UsersList
                    users={article.users}
                    onClickRemove={user => onUpdate({ ...article, users: article.users.filter(articleUser => articleUser.id !== user.id) })}
                />
            </CardContent>
            <CardContent>
                <GroupSelect
                    selectedGroups={article.groups}
                    variant={'outlined'}
                    onSelectGroups={groups => onUpdate({ ...article, groups })}
                />
            </CardContent>
            {!article.readyToPublish && (
                <CardContent>
                    <FormControl component={'fieldset'}>
                        <FormLabel component={'legend'}>
                            Gib den Beitrag zur Kontrolle frei, um ihn als 'fertig' zu markieren.
                            Ein Verantwortlicher kann ihn dann sichtbar schalten.
                    </FormLabel>
                        <FormControlLabel
                            value={1}
                            control={<Switch color={'secondary'} />}
                            onChange={(_, checked) => setIsReadyToPublish(checked)}
                            label={isReadyToPublish ? 'Beitrag wird zur Kontrolle freigegeben' : 'Zur Kontrolle freigeben'}
                            labelPlacement={'end'}
                        />
                    </FormControl>
                </CardContent>
            )}
            <CardContent>
                <ButtonGroup
                    variant={'outlined'}
                    color={'secondary'}
                    disabled={isLoading}
                    size={'small'}
                    aria-label="split button"
                    ref={saveOptionsMenuAnchorRef}
                    className={styles.button}
                    fullWidth
                >
                    <SaveButton
                        isLoading={isLoading}
                        onClick={() => onSave({ readyToPublish: isReadyToPublish, updatedAt: undefined })}
                        fullWidth
                    >

                        speichern
                    </SaveButton>
                    <Button
                        color={'secondary'}
                        size={'small'}
                        aria-owns={saveOptionMenuIsOpen ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        style={{ width: 'auto' }}
                        onClick={() => setSaveOptionMenuIsOpen(!saveOptionMenuIsOpen)}
                    >
                        <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                <Popper open={saveOptionMenuIsOpen} anchorEl={saveOptionsMenuAnchorRef.current} transition disablePortal className={styles.popper}>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom' ? 'top right' : 'bottom right',
                            }}
                        >
                            <Paper id="menu-list-grow">
                                <ClickAwayListener onClickAway={handleCloseSaveOptionsMenu}>
                                    <MenuList>
                                        <MenuItem onClick={() => onSave({ readyToPublish: isReadyToPublish, updatedAt: new Date(article.updatedAt).toISOString() })}>
                                            Ohne Aktualisierszeit zu ändern
                                        </MenuItem>
                                        <MenuItem onClick={() => onSave({ readyToPublish: isReadyToPublish, updatedAt: article.insertedAt })}>
                                            Aktualisierszeit auf Erstellszeit setzen
                                        </MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>

                <Button
                    color={'secondary'}
                    variant={'outlined'}
                    size={'small'}
                    onClick={() => history.goBack()}
                    fullWidth
                >
                    Abbrechen
                </Button>

                <Divider className={styles.deleteButtonDivider} />

                <Button
                    variant={'outlined'}
                    size={'small'}
                    className={styles.deleteButton}
                    onClick={() => setIsDeleteModalOpen(true)}
                    fullWidth
                >
                    <Warning className={clsx(styles.leftIcon, styles.iconSmall)} />
                    Beitrag löschen
                </Button>
                <ResponsiveFullScreenDialog open={isDeleteModalOpen}>
                    <DialogTitle>Beitrag löschen</DialogTitle>
                    <DialogContent>
                        <p>Möchtest du den Beitrag "{article.title}" wirklich löschen?</p>
                        <p>Der Beitrag ist dann unwiederbringbar verloren und kann nicht wiederhergestellt werden.</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDeleteModalOpen(false)}>Abbrechen</Button>
                        <Button color={'secondary'} onClick={() => deleteArticle()}>Löschen</Button>
                    </DialogActions>
                </ResponsiveFullScreenDialog>
            </CardContent>
        </Card>
    )
});