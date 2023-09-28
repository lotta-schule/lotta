import * as React from 'react';
import { useQuery } from '@apollo/client';
import { UserModel, UserGroupModel } from 'model';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { ComboBox, LinearProgress, Select, Table } from '@lotta-schule/hubert';
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
  const { data, loading: isLoading } = useQuery<{ users: UserModel[] }>(
    GetUsersQuery
  );

  const rows = React.useMemo(() => {
    return (
      data?.users
        ?.filter((user) =>
          selectedGroupsFilter.length
            ? user.groups.find((group) =>
                selectedGroupsFilter.find((g) => g.id === group.id)
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
            <UserAvatar className={styles.avatar} user={user} size={25} />
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
      <h5 className={styles.headline}>Nutzersuche</h5>
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
          <GroupSelect
            row
            hidePublicGroupSelection
            disableAdminGroupsExclusivity
            label={null}
            selectedGroups={selectedGroupsFilter}
            onSelectGroups={setSelectedGroupsFilter}
            className={styles.filter}
          />
          <div className={clsx(styles.filter, styles.selectfield)}>
            <Select title={'zuletzt angemeldet'} />
          </div>
          <div className={styles.gridContainer}>
            <div className={styles.gridItem}></div>
            <div className={clsx(styles.gridItem, styles.resultsGridItem)}>
              {t('administration.results', {
                count: rows.length,
              })}
            </div>
          </div>
          <div className={clsx(styles.respTable)}>
            <Table>
              <thead>
                <tr className={clsx(styles.tableHead)}>
                  <th></th>
                  <th>Name</th>
                  <th>Gruppen</th>
                  <th>Zuletzt Online</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ user, avatarImage, name, groups, lastSeen }) => (
                  <tr
                    key={user.id}
                    onClick={() => {
                      if (user.id !== currentUser?.id) {
                        setSelectedUser(user);
                      }
                    }}
                  >
                    <td>{avatarImage}</td>
                    <td>{name}</td>
                    <td>{groups}</td>
                    <td>{lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
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
