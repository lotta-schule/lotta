import React, { ChangeEvent, memo, useState, useEffect } from 'react';
import { CircularProgress, Grid, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Autocomplete } from '@material-ui/lab';
import { useLazyQuery } from '@apollo/client';
import { SearchUsersQuery } from 'api/query/SearchUsersQuery';
import { useDebounce } from 'util/useDebounce';
import { UserAvatar } from 'component/user/UserAvatar';
import { UserModel } from 'model';

const useStyles = makeStyles(() => ({
    avatar: {
        padding: '.25em',
        height: 50,
        width: 50
    }
}));

export interface SearchUserFieldProps {
    className?: string;
    style?: React.CSSProperties;
    onSelectUser(user: UserModel): void;
}

export const SearchUserField = memo<SearchUserFieldProps>(({ className, onSelectUser }) => {
    const styles = useStyles();
    const [searchtext, setSearchtext] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [autocompleteOptions, setAutocompleteOptions] = useState<UserModel[]>([]);
    const debouncedSearchtext = useDebounce(searchtext, 500);
    const [execute, { data, loading: isLoading }] = useLazyQuery<{ users: UserModel[] }, { searchtext: string }>(SearchUsersQuery);
    const selectUser = (user: UserModel | null) => {
        if (user) {
            onSelectUser(user);
        }
        setSearchtext('');
        setIsOpen(false);
    }

    useEffect(() => {
        if (debouncedSearchtext && debouncedSearchtext.length >= 2) {
            execute({ variables: { searchtext: debouncedSearchtext } })
        }
    }, [debouncedSearchtext, execute]);

    useEffect(() => {
        if (data?.users) {
            setAutocompleteOptions(data.users);
        }
    }, [data]);

    useEffect(() => {
        if (!isOpen) {
            setAutocompleteOptions([]);
        }
    }, [isOpen])

    return (
        <Autocomplete
            blurOnSelect
            autoHighlight
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            onChange={(_e: ChangeEvent<{}>, user: UserModel | null) => selectUser(user)}
            getOptionLabel={option => option.name!}
            options={autocompleteOptions}
            loading={isLoading}
            renderInput={params => (
                <TextField
                    {...params}
                    fullWidth
                    className={className}
                    label={'Nutzer suchen'}
                    variant={'outlined'}
                    onChange={e => setSearchtext(e.target.value)}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
            renderOption={user => (
                <Grid container alignItems="center" role={'option'}>
                    <Grid item>
                        <UserAvatar className={styles.avatar} user={user} size={100} />
                    </Grid>
                    <Grid item xs>
                        <Typography variant="body1" color="textPrimary">
                            {user.name}&nbsp;
                            {user.nickname && <>(<strong>{user.nickname}</strong>)</>}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {user.email}
                        </Typography>
                    </Grid>
                </Grid>
            )}
        />
    );
});
