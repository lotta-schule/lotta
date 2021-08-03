import * as React from 'react';
import { UserModel } from 'model';
import { Badge, makeStyles, Tooltip } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import { User } from 'util/model';
import { theme } from 'theme';
import { UserAvatar } from 'component/user/UserAvatar';
import { Button } from 'component/general/button/Button';
import { Close } from '@material-ui/icons';
import { SearchUserField } from 'component/layouts/adminLayout/userManagement/SearchUserField';
import clsx from 'clsx';

import './authors-avatars-list.scss';

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
                const userAvatar = (
                    <Tooltip
                        title={User.getNickname(user)}
                        key={user.id}
                        enterTouchDelay={100}
                    >
                        <UserAvatar
                            user={user}
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                            }}
                            size={25}
                        />
                    </Tooltip>
                );
                const isDeletable = !!onUpdate;
                if (isDeletable) {
                    return (
                        <Badge
                            key={user.id}
                            badgeContent={
                                <Button
                                    small
                                    style={{ width: 15, height: 15 }}
                                    icon={
                                        <Close
                                            style={{ width: 8, height: 8 }}
                                        />
                                    }
                                    title={`Autor ${User.getNickname(
                                        user
                                    )} entfernen`}
                                    onClick={() =>
                                        onUpdate!(
                                            users.filter(
                                                (u) => u.id !== user.id
                                            )
                                        )
                                    }
                                />
                            }
                        >
                            {userAvatar}
                        </Badge>
                    );
                }
                return userAvatar;
            },
            [onUpdate, users]
        );

        if (!users) {
            return null;
        }
        return (
            <div
                data-testid={'AuthorAvatarsList'}
                className={clsx('lotta-authors-avatars-list', className)}
            >
                <AvatarGroup
                    max={max ?? 3}
                    classes={{
                        root: 'avatar-group',
                        avatar: 'avatar',
                    }}
                >
                    {users.map((user) => getAvatar(user))}
                </AvatarGroup>
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
