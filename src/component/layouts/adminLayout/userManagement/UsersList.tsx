import * as React from 'react';
import { LinearProgress, Divider, TextField, Theme, Typography, makeStyles, Grid } from '@material-ui/core';
import { EditUserPermissionsDialog } from './EditUserPermissionsDialog';
import { useQuery } from '@apollo/client';
import { UserModel, UserGroupModel } from 'model';
import { GetUsersQuery } from 'api/query/GetUsersQuery';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { UserAvatar } from 'component/user/UserAvatar';
import { GroupSelect } from 'component/edit/GroupSelect';
import { VirtualizedTable } from 'component/general/VirtualizedTable';
import { SearchUserField } from './SearchUserField';
import { Block } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import clsx from 'clsx';

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
    },
    resultsGridItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    searchUserField: {
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

export const UsersList = React.memo(() => {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();

    const [selectedUser, setSelectedUser] = React.useState<UserModel | null>(null);
    const [selectedGroupsFilter, setSelectedGroupsFilter] = React.useState<UserGroupModel[]>([]);
    const [filterText, setFilterText] = React.useState('');
    const { data, loading: isLoading } = useQuery<{ users: UserModel[] }>(GetUsersQuery);

    const styles = useStyles();

    const rows = React.useMemo(() => {
        return data?.users?.filter(user =>
            selectedGroupsFilter.length ? user.groups.find(group => selectedGroupsFilter.find(g => g.id === group.id)) : true
        )?.filter(user =>
            filterText ? new RegExp(filterText.replace(/[.+?^${}()|[\]\\]/g, '\\$&'), 'igu').test(user.name!) : true
        )?.map(user =>
            ({
                avatarImage: <UserAvatar className={styles.avatar} user={user} size={25} />,
                name: <>{user.isBlocked && <Block color={'error'} />}{user.name}{user.nickname && <> &nbsp; (<strong>{user.nickname}</strong>)</>}</>,
                groups: user.groups.map(g => g.name).join(', '),
                lastSeen: user.lastSeen ? format(new Date(user.lastSeen), 'PPP', { locale: de }) : '',
                user,
            })
        ) ?? [];
    }, [data, filterText, selectedGroupsFilter, styles.avatar]);

    return (
        <>
            <SearchUserField
                className={clsx(styles.inputField, styles.searchUserField, styles.headline)}
                onSelectUser={setSelectedUser}
            />

            {isLoading && (
                <LinearProgress data-testid="loading" />
            )}

            {!isLoading && (
                <>
                    <Divider className={styles.divider} />

                    <Typography variant={'h5'} className={styles.headline}>Registrierte Nutzer</Typography>
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
                                inputProps={{ 'aria-label': 'Nach Name filtern' }}
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
                                width: 45,
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
                            },
                            {
                                width: 200,
                                label: 'Zuletzt Online',
                                dataKey: 'lastSeen',
                            },
                        ]}
                    />
                </>
            )}
            {selectedUser && (
                <EditUserPermissionsDialog
                    onClose={() => setSelectedUser(null)}
                    user={selectedUser}
                />
            )}
        </>
    );

});
