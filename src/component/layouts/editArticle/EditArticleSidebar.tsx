import React, { memo, useState, MouseEvent } from 'react';
import { ArticleModel } from '../../../model';
import {
    Card, CardContent, TextField, Button, makeStyles, Typography, FormControl, FormLabel, FormControlLabel,
    Switch, ButtonGroup, Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem
} from '@material-ui/core';
import { CategorySelect } from './CategorySelect';
import { DateTimePicker } from '@material-ui/pickers';
import { GroupSelect } from './GroupSelect';
import { parseISO } from 'date-fns';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { Save as SaveIcon, ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';
import { SearchUserField } from '../adminLayout/userManagement/SearchUserField';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { uniqBy } from 'lodash';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { UsersList } from './UsersList';
import classNames from 'classnames';
import Img from 'react-cloudimage-responsive';
import useRouter from 'use-react-router';

const useStyles = makeStyles(theme => ({
    root: {
        borderRadius: '0'
    },
    button: {
        marginBottom: theme.spacing(1),
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
    onUpdate(article: ArticleModel): void;
    onSave(additionalProps?: Partial<ArticleModel>): void;
}

export const EditArticleSidebar = memo<EditArticleSidebarProps>(({ article, onUpdate, onSave }) => {
    const styles = useStyles();
    const [currentUser] = useCurrentUser();
    const { history } = useRouter();

    const [isReadyToPublish, setIsReadyToPublish] = useState(article.readyToPublish || false);
    const [saveOptionMenuIsOpen, setSaveOptionMenuIsOpen] = React.useState(false);
    const saveOptionsMenuAnchorRef = React.useRef<HTMLDivElement | null>(null);

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
                    label="Datum"
                    inputVariant="outlined"
                    ampm={false}
                    disableFuture={true}
                    animateYearScrolling={true}
                    value={parseISO(article.insertedAt)}
                    onChange={date => date && onUpdate({ ...article, insertedAt: date.toISOString() })}
                />
            </CardContent>
            {User.isAdmin(currentUser) && (
                <>
                    <CardContent>
                        <CategorySelect
                            selectedCategoryId={article.category && article.category.id}
                            onSelectCategory={category => onUpdate({ ...article, category })}
                        />
                    </CardContent>
                    <CardContent>
                        <TextField
                            label="Thema"
                            value={article.topic || ''}
                            onChange={e => onUpdate({ ...article, topic: e.target.value || '' })}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </CardContent>
                </>
            )}
            <CardContent>
                <SelectFileOverlay label={'Vorschaubild ändern'} onSelectFile={previewImageFile => onUpdate({ ...article, previewImageFile })}>
                    {article.previewImageFile ? (
                        <Img operation={'width'} size={'300x200'} src={article.previewImageFile.remoteLocation} />
                    ) : <PlaceholderImage width={'100%'} height={150} />}
                </SelectFileOverlay>
            </CardContent>
            <CardContent>
                {User.isAdmin(currentUser) && (
                    <SearchUserField
                        className={styles.searchUserField}
                        onSelectUser={user => onUpdate({ ...article, users: uniqBy(article.users.concat([user]), 'id') })}
                    />
                )}
                <UsersList
                    users={article.users}
                    onClickRemove={user => onUpdate({ ...article, users: article.users.filter(articleUser => articleUser.id !== user.id) })}
                />
            </CardContent>
            <CardContent>
                <GroupSelect
                    selectedGroup={article.group || null}
                    variant={'outlined'}
                    onSelectGroup={group => onUpdate({ ...article, group: group || undefined })}
                />
            </CardContent>
            {!article.readyToPublish && (
                <CardContent>
                    <FormControl component={'fieldset'}>
                        <FormLabel component={'legend'}>
                            Gib den Artikel zur Kontrolle frei, um ihn als 'fertig' zu markieren.
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
                    variant="outlined"
                    color="secondary"
                    size={'small'}
                    aria-label="split button"
                    ref={saveOptionsMenuAnchorRef}
                    className={styles.button}
                    fullWidth
                >
                    <Button
                        onClick={() => onSave({ readyToPublish: isReadyToPublish, updatedAt: undefined })}
                        fullWidth
                    >
                        <SaveIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                        speichern
                    </Button>
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
                                        <MenuItem onClick={() => onSave({ readyToPublish: isReadyToPublish, updatedAt: parseISO(article.updatedAt).toISOString() })}>
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
            </CardContent>
        </Card>
    )
});