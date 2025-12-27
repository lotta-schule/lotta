import * as React from 'react';
import { ComboBox, NoSsr } from '@lotta-schule/hubert';
import { useLazyQuery } from '@apollo/client/react';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { UserModel } from 'model';
import { User } from 'util/model';
import clsx from 'clsx';

import styles from './SearchUserField.module.scss';

import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';

export interface SearchUserFieldProps {
  style?: React.CSSProperties;

  className?: string;

  label?: string | null;

  disabled?: boolean;

  /**
   * Only needed when the users should be marked as 'selected'
   * on the search results listbox.
   */
  selectedUsers?: UserModel[];

  onSelectUser(user: UserModel): void;
}

export const SearchUserField = React.memo(
  ({
    className,
    style,
    label,
    selectedUsers,
    onSelectUser,
    disabled,
  }: SearchUserFieldProps) => {
    const [execute, { data }] = useLazyQuery<
      { users: UserModel[] },
      { searchtext: string }
    >(SearchUsersQuery);

    return (
      <NoSsr>
        <div
          className={clsx(styles.root, className)}
          style={style}
          data-testid="SearchUserField"
        >
          <ComboBox
            fullWidth
            hideLabel
            disabled={disabled}
            title={label ?? 'Nutzer suchen'}
            className={styles.comboBox}
            items={async (searchtext) => {
              const { data } = await execute({
                variables: { searchtext },
              });
              return (data?.users ?? []).map((user) => ({
                key: user.id,
                label: User.getName(user),
                textValue: User.getName(user),
                selected: !!selectedUsers?.find(
                  (selectedUser) => selectedUser.id === user.id
                ),
                leftSection: (
                  <UserAvatar
                    user={user}
                    size={25}
                    className={styles.userAvatar}
                  />
                ),
              }));
            }}
            onSelect={(userId) => {
              const user = data?.users.find((user) => user.id === userId);
              if (user) {
                onSelectUser?.(user);
              }
            }}
          />
        </div>
      </NoSsr>
    );
  }
);
SearchUserField.displayName = 'SearchUserField';
