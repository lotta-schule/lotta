import * as React from 'react';
import { LinearProgress, Divider, Grid } from '@material-ui/core';
import { EditUserPermissionsDialog } from 'component/layouts/adminLayout/userManagement/EditUserPermissionsDialog';
import { useQuery } from '@apollo/client';
import { UserModel, UserGroupModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { UserAvatar } from 'component/user/UserAvatar';
import { GroupSelect } from 'component/edit/GroupSelect';
import { VirtualizedTable } from 'component/general/VirtualizedTable';
import { SearchUserField } from 'component/layouts/adminLayout/userManagement/SearchUserField';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Input } from 'component/general/form/input/Input';
import { GetServerSidePropsContext } from 'next';
import { AdminLayout } from 'component/layouts/adminLayout/AdminLayout';
import { AccountCircle } from '@material-ui/icons';
import GetUsersQuery from 'api/query/GetUsersQuery.graphql';
import clsx from 'clsx';

import styles from './list.module.scss';

export const List = () => {
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
        <AdminLayout
            title={
                <>
                    <AccountCircle /> Nutzer
                </>
            }
            hasHomeLink
        >
            <SearchUserField
                className={clsx(styles.headline)}
                onSelectUser={setSelectedUser}
            />

            {isLoading && <LinearProgress data-testid="loading" />}

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
                    <Grid container>
                        <Grid item xs={12} sm={6}>
                            <Input
                                value={filterText}
                                onChange={(e) =>
                                    setFilterText(e.currentTarget.value)
                                }
                                placeholder={'Tabelle nach Name filtern'}
                                aria-label={'Nach Name filtern'}
                            />
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            className={styles.resultsGridItem}
                        >
                            {t('administration.results', {
                                count: rows.length,
                            })}
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
        </AdminLayout>
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default List;
