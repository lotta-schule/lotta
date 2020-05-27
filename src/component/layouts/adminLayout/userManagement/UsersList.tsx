import React, { memo, useMemo, useState } from 'react';
import { CircularProgress, Divider, TextField, Theme, Typography, makeStyles, Grid } from '@material-ui/core';
import { AssignUserToGroupsDialog } from './AssignUserToGroupsDialog';
import { useQuery } from '@apollo/client';
import { UserModel, UserGroupModel } from 'model';
import { GetUsersQuery } from 'api/query/GetUsersQuery';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useUserGroups } from 'util/client/useUserGroups';
import { UserAvatar } from 'component/user/UserAvatar';
import { GroupSelect } from 'component/edit/GroupSelect';
import { VirtualizedTable } from 'component/general/VirtualizedTable';
import { SearchUserField } from './SearchUserField';
import { Block } from '@material-ui/icons';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
    avatar: {
        height: '1em',
        width: '1em',
        margin: '.15em .25em .15em 0',
    },
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),

    },
    headline: {
        marginBottom: theme.spacing(2),
    },
    inputField: {
        maxWidth: 400
    },
    resultsGridItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    searchUserField: {
        maxWidth: 400,
        backgroundColor: theme.palette.grey[200]
    },
    formControl: {
        width: '100%',
    },
    virtualizedTable: {
        '& .ReactVirtualized__Table__headerColumn:last-child': {
            flex: '1 !important'
        }
    }
}));

export const UsersList = memo(() => {
    const { t } = useTranslation();
    const [currentUser] = useCurrentUser();
    const groups = useUserGroups();

    const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
    const [selectedGroupsFilter, setSelectedGroupsFilter] = useState<UserGroupModel[]>([...groups]);
    const [filterText, setFilterText] = useState('');
    const { data, loading } = useQuery<{ users: UserModel[] }>(GetUsersQuery);

    const styles = useStyles();

    const rows = useMemo(() => {
        return data?.users?.filter(user =>
            user.groups.find(group => selectedGroupsFilter.find(g => g.id === group.id))
        )?.filter(user =>
            !filterText ? true : new RegExp(filterText.replace(/[.+?^${}()|[\]\\]/g, '\\$&'), 'igu').test(user.name)
        )?.map(user =>
            ({
                avatarImage: <UserAvatar className={styles.avatar} user={user} size={25} />,
                name: <>{user.isBlocked && <Block color={'error'} />}{user.name}{user.nickname && <> &nbsp; (<strong>{user.nickname}</strong>)</>}</>,
                groups: user.groups.map(g => g.name).join(', '),
                user
            })
        ) ?? [];
    }, [data, filterText, selectedGroupsFilter, styles.avatar]);

    if (loading) {
        return (
            <CircularProgress />
        );
    }

    if (data?.users) {
        return (
            <>
                <SearchUserField className={clsx(styles.inputField, styles.searchUserField, styles.headline)} onSelectUser={setSelectedUser} />

                <Divider className={styles.divider} />

                <Typography variant={'h5'} className={styles.headline}>In Gruppen eingetragene Nutzer</Typography>
                <GroupSelect
                    row
                    hidePublicGroupSelection
                    disableAdminGroupsExclusivity
                    label={null}
                    selectedGroups={selectedGroupsFilter}
                    onSelectGroups={setSelectedGroupsFilter}
                />
                <Grid container>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            className={styles.inputField}
                            margin={'dense'}
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            placeholder={'Tabelle nach Name filtern'}
                            helperText={'"*"-Zeichen ersetzt beliebige Zeichen'}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} className={styles.resultsGridItem}>
                        <Typography variant={'body1'}>
                            {t('administration.results', { count: rows.length })}
                        </Typography>
                    </Grid>
                </Grid>
                <VirtualizedTable
                    className={styles.virtualizedTable}
                    rowCount={rows.length}
                    rowGetter={({ index }) => rows[index]}
                    headerHeight={48}
                    rowHeight={48}
                    onRowClick={({ rowData: { user } }) => {
                        if (user.id !== currentUser?.id) {
                            setSelectedUser(user);
                        }
                    }}
                    columns={[
                        {
                            width: 30,
                            label: '',
                            dataKey: 'avatarImage',
                        },
                        {
                            width: 300,
                            label: 'Name',
                            dataKey: 'name',
                        },
                        {
                            label: 'Gruppen',
                            dataKey: 'groups',
                        }
                    ]}
                />
                {selectedUser && (
                    <AssignUserToGroupsDialog
                        onClose={() => setSelectedUser(null)}
                        user={selectedUser}
                    />
                )}
            </>
        );
    } else {
        return null;
    }

});