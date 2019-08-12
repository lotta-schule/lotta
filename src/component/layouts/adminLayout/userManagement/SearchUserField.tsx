import React, { memo, useState, useEffect, useCallback, MouseEvent } from 'react';
import { UserModel } from 'model';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';
import { IconButton, InputBase, Theme, Paper, MenuItem, ListItemAvatar, ListItemText, CircularProgress } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { useLazyQuery } from '@apollo/react-hooks';
import { SearchUsersQuery } from 'api/query/SearchUsersQuery';
import Downshift from 'downshift';
import { User } from 'util/model';
import { useDebounce } from 'util/useDebounce';
import { UserAvatar } from 'component/user/UserAvatar';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        width: 400,
        backgroundColor: '#efefef',
        borderRadius: 4,
    },
    input: {
        marginLeft: theme.spacing(1),
        width: '100%'
    },
    avatar: {
        padding: '.25em',
        height: 50,
        width: 50
    },
    menuContainer: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing(1),
        width: '100%',
        left: 0,
        right: 0,
    }
}));

export interface SearchUserFieldProps {
    className?: string;
    onSelectUser(user: UserModel): void;
}

export const SearchUserField = memo<SearchUserFieldProps>(({ className, onSelectUser }) => {
    const styles = useStyles();
    const [searchtext, setSearchtext] = useState('');
    const debouncedSearchtext = useDebounce(searchtext, 500);
    const [execute, { data, loading }] = useLazyQuery<{ users: UserModel[] }, { searchtext: string }>(SearchUsersQuery);

    const onSelect = useCallback((e: MouseEvent<HTMLElement>, user: UserModel) => {
        e.preventDefault();
        setSearchtext('');
        onSelectUser(user);
    }, [onSelectUser]);

    useEffect(() => {
        if (debouncedSearchtext && debouncedSearchtext.length > 3) {
            execute({ variables: { searchtext: debouncedSearchtext } })
        }
    }, [debouncedSearchtext, execute]);

    return (
        <div className={classNames(styles.root, className)}>
            <IconButton aria-label="Suche">
                <Search />
            </IconButton>

            <Downshift id="downshift-simple">
                {({
                    getInputProps,
                    getItemProps,
                    getLabelProps,
                    getMenuProps,
                    highlightedIndex,
                    inputValue,
                    isOpen,
                    selectedItem,
                }) => {
                    if (inputValue) {
                        setSearchtext(inputValue);
                    }
                    const { ...inputProps } = getInputProps({
                        placeholder: 'Nach Namen suchen oder Email-Adresse eingeben...',
                    });

                    return (
                        <div style={{ position: 'relative', flex: 1 }}>
                            <InputBase
                                placeholder="Suche nach Nutzern"
                                className={styles.input}
                                inputProps={inputProps}
                            />

                            <div {...getMenuProps()}>
                                {isOpen ? (
                                    <Paper className={styles.menuContainer} square>
                                        {((inputValue && inputValue.length > 3 && data && data.users) || []).map((userSuggestion, index) =>
                                            <MenuItem
                                                {...getItemProps({ item: userSuggestion.id, onClick: e => onSelect(e, userSuggestion) })}
                                                key={userSuggestion.id}
                                                selected={index === highlightedIndex}
                                                component="div"
                                                button
                                                dense
                                            >
                                                <ListItemAvatar>
                                                    <UserAvatar className={styles.avatar} user={userSuggestion} />
                                                </ListItemAvatar>
                                                <ListItemText primary={`${userSuggestion.nickname && userSuggestion.nickname + ' | '}${User.getName(userSuggestion)}`} secondary={userSuggestion.email} />
                                            </MenuItem>
                                        )}
                                    </Paper>
                                ) : null}
                            </div>
                        </div>
                    );
                }}
            </Downshift>

            {loading && (
                <CircularProgress />
            )}
        </div>
    );
});