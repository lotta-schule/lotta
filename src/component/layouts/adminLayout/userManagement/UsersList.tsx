import React, { memo, useMemo, useState } from 'react';
import { CircularProgress, Theme, makeStyles } from '@material-ui/core';
import { AssignUserToGroupsDialog } from './AssignUserToGroupsDialog';
import { useQuery } from 'react-apollo';
import { UserModel, UserGroupModel } from 'model';
import { GetUsersQuery } from 'api/query/GetUsersQuery';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useUserGroups } from 'util/client/useUserGroups';
import { UserAvatar } from 'component/user/UserAvatar';
import { GroupSelect } from 'component/edit/GroupSelect';
import { VirtualizedTable } from 'component/general/VirtualizedTable';
import { SearchUserField } from './SearchUserField';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
    avatar: {
        height: '1em',
        width: '1em',
        margin: '.15em .25em .15em 0',
    },
    headlines: {
        marginBottom: theme.spacing(2),
    },
    searchUserField: {
        width: 'auto',
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
    const [currentUser] = useCurrentUser();
    const groups = useUserGroups();

    const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
    const [selectedGroupsFilter, setSelectedGroupsFilter] = useState<UserGroupModel[]>([...groups]);
    const { data, loading } = useQuery<{ users: UserModel[] }>(GetUsersQuery);

    const styles = useStyles();

    const rows = useMemo(() => {
        return data?.users?.filter(user =>
            user.groups.find(group => selectedGroupsFilter.find(g => g.id === group.id))
        )?.map(user =>
            ({
                avatarImage: <UserAvatar className={styles.avatar} user={user} />,
                name: <>{user.name}{user.nickname && <> &nbsp; (<strong>{user.nickname}</strong>)</>}</>,
                groups: user.groups.map(g => g.name).join(', '),
                user
            })
        ) ?? [];
    }, [data, selectedGroupsFilter, styles.avatar]);

    if (loading) {
        return (
            <CircularProgress />
        );
    }

    if (data?.users) {
        return (
            <>
                <SearchUserField className={classNames(styles.searchUserField, styles.headlines)} onSelectUser={setSelectedUser} />
                <GroupSelect
                    row
                    hidePublicGroupSelection
                    disableAdminGroupsExclusivity
                    label={null}
                    selectedGroups={selectedGroupsFilter}
                    onSelectGroups={setSelectedGroupsFilter}
                />
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
                        onAbort={() => setSelectedUser(null)}
                        onConfirm={() => {
                            setSelectedUser(null);
                        }}
                        user={selectedUser}
                    />
                )}
            </>
        );
    } else {
        return null;
    }

});