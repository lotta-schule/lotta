import * as React from 'react';
import { UserModel } from 'model';
import { AvatarGroup, Deletable, Tooltip } from '@lotta-schule/hubert';
import { User } from 'util/model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { SearchUserField } from 'administration/users/SearchUserField';
import clsx from 'clsx';

import styles from './AuthorAvatarsList.module.scss';

export interface AuthorAvatarsListProps {
    users: UserModel[];
    className?: string;
    max?: number;
    onUpdate?: (users: UserModel[]) => void;
}

export const AuthorAvatarsList = React.memo<AuthorAvatarsListProps>(
    ({ users, className, max, onUpdate }) => {
        const getAvatar = React.useCallback(
            (user: UserModel) => {
                return (
                    <Deletable
                        title={`Autor ${User.getNickname(user)} entfernen`}
                        key={user.id}
                        onDelete={
                            onUpdate
                                ? () =>
                                      onUpdate(
                                          users.filter((u) => u.id !== user.id)
                                      )
                                : null
                        }
                    >
                        <Tooltip label={User.getNickname(user)}>
                            <UserAvatar
                                user={user}
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: '50%',
                                }}
                                title={`Profilbild von ${User.getNickname(
                                    user
                                )}`}
                                size={25}
                            />
                        </Tooltip>
                    </Deletable>
                );
            },
            [onUpdate, users]
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
