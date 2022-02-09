import * as React from 'react';
import { useQuery } from '@apollo/client';
import { UserModel, UserGroupModel } from 'model';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { VirtualizedTable } from 'shared/general/VirtualizedTable';
import { Divider } from 'shared/general/divider/Divider';
import { Input } from 'shared/general/form/input/Input';
import { LinearProgress } from 'shared/general/progress/LinearProgress';
import { SearchUserField } from './SearchUserField';
import { EditUserPermissionsDialog } from './EditUserPermissionsDialog';
import clsx from 'clsx';

import GetUsersQuery from 'api/query/GetUsersQuery.graphql';

import styles from './UserList.module.scss';

export const UserList = React.memo(() => {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();

    const [selectedUser, setSelectedUser] = React.useState<UserModel | null>(
        null
    );
    const [selectedGroupsFilter, setSelectedGroupsFilter] = React.useState<
        UserGroupModel[]
    >([]);
    const [filterText, setFilterText] = React.useState('');
    const { data, loading: isLoading } =
        useQuery<{ users: UserModel[] }>(GetUsersQuery);

    const rows = React.useMemo(() => {
        return (
            data?.users
                ?.filter((user) =>
                    selectedGroupsFilter.length
                        ? user.groups.find((group) =>
                              selectedGroupsFilter.find(
                                  (g) => g.id === group.id
                              )
                          )
                        : true
                )
                ?.filter((user) =>
                    filterText
                        ? new RegExp(
                              filterText.replace(/[.+?^${}()|[\]\\]/g, '\\$&'),
                              'igu'
                          ).test(user.name!)
                        : true
                )
                ?.map((user) => ({
                    avatarImage: (
                        <UserAvatar
                            className={styles.avatar}
                            user={user}
                            size={25}
                        />
                    ),
                    name: (
                        <>
                            {user.name}
                            {user.nickname && (
                                <>
                                    {' '}
                                    &nbsp; (<strong>{user.nickname}</strong>)
                                </>
                            )}
                        </>
                    ),
                    groups: user.groups.map((g) => g.name).join(', '),
                    lastSeen: user.lastSeen
                        ? format(new Date(user.lastSeen), 'PPP', { locale: de })
                        : '',
                    user,
                })) ?? []
        );
    }, [data, filterText, selectedGroupsFilter]);

    return (
        <div className={styles.root}>
            <SearchUserField
                className={clsx(styles.headline)}
                onSelectUser={setSelectedUser}
            />

            {isLoading && (
                <LinearProgress
                    isIndeterminate
                    label={'Nutzersuche läuft'}
                    data-testid="loading"
                />
            )}

            {!isLoading && (
                <>
                    <Divider className={styles.divider} />

                    <h5 className={styles.headline}>Registrierte Nutzer</h5>
                    <GroupSelect
                        row
                        hidePublicGroupSelection
                        disableAdminGroupsExclusivity
                        label={null}
                        selectedGroups={selectedGroupsFilter}
                        onSelectGroups={setSelectedGroupsFilter}
                    />

                    <div className={styles.gridContainer}>
                        <div className={styles.gridItem}>
                            <Input
                                value={filterText}
                                onChange={(e) =>
                                    setFilterText(e.currentTarget.value)
                                }
                                placeholder={'Tabelle nach Name filtern'}
                                aria-label={'Nach Name filtern'}
                            />
                        </div>
                        <div
                            className={clsx(
                                styles.gridItem,
                                styles.resultsGridItem
                            )}
                        >
                            {t('administration.results', {
                                count: rows.length,
                            })}
                        </div>
                    </div>

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
                                width: 50,
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
                    onRequestClose={() => setSelectedUser(null)}
                    user={selectedUser}
                />
            )}
        </div>
    );
});
UserList.displayName = 'AdminUserList';
