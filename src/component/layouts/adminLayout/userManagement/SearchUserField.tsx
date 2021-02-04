import React, { memo, useState, useEffect } from 'react';
import { CircularProgress, Grid, NoSsr, TextField, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useAutocomplete } from '@material-ui/lab';
import { useLazyQuery } from '@apollo/client';
import { SearchUsersQuery } from 'api/query/SearchUsersQuery';
import { useDebounce } from 'util/useDebounce';
import { UserAvatar } from 'component/user/UserAvatar';
import { UserModel } from 'model';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        margin: theme.spacing(1, 0),
        position: 'relative'
    },
    inputWrapper: {
        color: 'inherit',
        position: 'relative'
    },
    inputLoading: {
        position: 'absolute',
        top: 0,
        right: theme.spacing(1)
    },
    listBox: {
        margin: theme.spacing(1, 0, 0),
        width: 'auto',
        padding: 0,
        position: 'absolute',
        top: '100%',
        left: 0,
        listStyle: 'none',
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
        maxHeight: 250,
        zIndex: 10000,

        '& li': {
            padding: theme.spacing(1, 2),
            display: 'flex',
        },

    },
    avatar: {
        padding: '.25em',
        height: 50,
        width: 50
    }
}));

export interface SearchUserFieldProps {
    className?: string;
    variant?: 'filled' | 'outlined' | 'standard';
    label?: string | null;
    disabled?: boolean;
    style?: React.CSSProperties;
    onSelectUser(user: UserModel): void;
}

export const SearchUserField = memo<SearchUserFieldProps>(({ className, variant, label, disabled, style, onSelectUser }) => {
    const styles = useStyles();
    const [searchtext, setSearchtext] = useState('');
    const [execute, { data, loading: isLoading }] = useLazyQuery<{ users: UserModel[] }, { searchtext: string }>(SearchUsersQuery);
    const debouncedSearchtext = useDebounce(searchtext, 500);
    const selectUser = (user: UserModel | null) => {
        if (user) {
            onSelectUser(user);
        }
        setSearchtext('');
    }

    useEffect(() => {
        if (debouncedSearchtext.length >= 2) {
            execute({ variables: { searchtext: debouncedSearchtext } })
        }
    }, [debouncedSearchtext, execute]);

    const {
        getRootProps,
        getInputLabelProps,
        getInputProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
        focused,
        setAnchorEl,
        // value
        // getTagProps
    } = useAutocomplete({
        id: 'user-select',
        value: null,
        inputValue: searchtext,
        options: data?.users ?? [],
        getOptionLabel: option => option.nickname || option.name || '',
        getOptionSelected: (_option, _value) => false,
        filterOptions: (options, _state) => options,
        onInputChange: (_event, value, reason) => {
            if (reason !== 'reset') {
                setSearchtext(value);
            }
        },
        onChange: (_event, value, _reason, _details) => {
            selectUser(value);
        },
        onClose: (_event, reason) => {
            if (reason === 'blur') {
                setSearchtext('');
            }
        }
    });


    return (
        <NoSsr>
            <div className={clsx(styles.root, className)} data-testid="SearchUserField">
                <div {...getRootProps()} data-testid="SearchUserFieldSelection">
                    <Typography component={'label'} htmlFor={'search-user-input-field'} {...getInputLabelProps()}>{label || 'Nutzer suchen:'}</Typography>
                    <div ref={setAnchorEl} className={clsx(styles.inputWrapper, { focused })}>
                        <TextField
                            fullWidth
                            id={'search-user-input-field'}
                            disabled={disabled}
                            variant={variant}
                            size={'small'}
                            placeholder={'Nutzer nach Namen suchen oder korrekte E-Mail-Adresse eingeben.'}
                            {...getInputProps()}
                        />
                        {isLoading && <CircularProgress className={styles.inputLoading} size={20} />}
                    </div>
                </div>
                {groupedOptions.length > 0 ? (
                    <ul className={styles.listBox} data-testid="UserSearchSelection" {...getListboxProps()}>
                        {groupedOptions.map((option, index) => (
                            <li {...getOptionProps({ option, index })}>
                                <Grid container alignItems="center">
                                    <Grid item>
                                        <UserAvatar className={styles.avatar} user={option} size={100} />
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="body1" color="textPrimary">
                                            {option.name && <>{option.name}&nbsp;(<strong>{option.nickname}</strong>)</>}
                                            {(!option.name && option.nickname) && <strong>{option.nickname}</strong>}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </NoSsr>
    );

});
