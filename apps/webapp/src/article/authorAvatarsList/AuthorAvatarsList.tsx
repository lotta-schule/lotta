import * as React from 'react';
import { UserPreviewModel } from '#/model/index.js';
import { AvatarGroup, Deletable, Tooltip } from '@lotta-schule/hubert';
import { User } from '#/util/model/index.js';
import { UserAvatar } from '#/shared/userAvatar/UserAvatar.js';
import { SearchUserField } from '#/component/form/index.js';
import clsx from 'clsx';

import styles from './AuthorAvatarsList.module.scss';

export interface AuthorAvatarsListProps {
  users: UserPreviewModel[];
  className?: string;
  max?: number;
  onClick?: (user: UserPreviewModel) => void;
  onUpdate?: (users: UserPreviewModel[]) => void;
}

export const AuthorAvatarsList = React.memo(
  ({ users, className, max, onClick, onUpdate }: AuthorAvatarsListProps) => {
    const getAvatar = React.useCallback(
      (user: UserPreviewModel) => {
        return (
          <Deletable
            title={`Autor ${User.getNickname(user)} entfernen`}
            key={user.id}
            onDelete={
              onUpdate
                ? () => onUpdate(users.filter((u) => u.id !== user.id))
                : null
            }
          >
            <Tooltip label={User.getNickname(user)}>
              <UserAvatar
                user={user}
                onClick={() => onClick?.(user)}
                size={30}
              />
            </Tooltip>
          </Deletable>
        );
      },
      [onUpdate, users, onClick]
    );

    return (
      <div
        data-testid={'AuthorAvatarsList'}
        className={clsx(styles.root, className)}
      >
        {users && (
          <AvatarGroup max={max ?? 3} className={styles.avatarGroup}>
            {users.map((user) => getAvatar(user))}
          </AvatarGroup>
        )}
        {!!onUpdate && (
          <SearchUserField
            label={'Autor hinzufügen'}
            selectedUsers={users}
            onSelectUser={(user) => {
              if (!users.find((u) => u.id === user.id)) {
                onUpdate([...users, user]);
              }
            }}
          />
        )}
      </div>
    );
  }
);
AuthorAvatarsList.displayName = 'AuthorAvatarsList';
