import * as React from 'react';
import { Badge } from '@material-ui/core';
import { ConversationModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { User } from 'util/model';
import { Button } from 'shared/general/button/Button';
import { format } from 'date-fns';
import { Message } from 'util/model/Message';
// import { useNewMessagesBadgeNumber } from './hook/useNewMessagesBadgeNumber';
import de from 'date-fns/locale/de';
import clsx from 'clsx';

import styles from './ConversationPreview.module.scss';

export interface ConversationPreviewProps {
    conversation: ConversationModel;
    selected?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ConversationPreview = React.memo<ConversationPreviewProps>(
    ({ conversation, selected, onClick }) => {
        const newMessagesBadgeNumber = 12; /* useNewMessagesBadgeNumber(
            (counterpart as UserModel).avatarImageFile !== undefined
                ? { user: counterpart as UserModel }
                : { group: counterpart as UserGroupModel }
        ); */
        const currentUser = useCurrentUser()!;

        const user =
            conversation.users.find((u) => u.id !== currentUser!.id) ?? null;
        const group = conversation.groups[0] ?? null;

        return (
            <Button
                onClick={onClick}
                className={clsx(styles.root, { [styles.selected]: selected })}
                title={`Unterhaltung mit ${Message.getDestinationName(
                    Message.conversationAsDestination(conversation, currentUser)
                )}`}
            >
                {user && (
                    <UserAvatar
                        user={user}
                        size={50}
                        classes={{ root: styles.userAvatar }}
                    />
                )}
                <div className={styles.buttonLabel}>
                    <Badge
                        badgeContent={newMessagesBadgeNumber}
                        color={'primary'}
                    >
                        <strong>
                            {user && User.getName(user)}
                            {group?.name}
                        </strong>
                    </Badge>
                </div>
                <div className={styles.dateLabel}>
                    {format(new Date(conversation.updatedAt), 'P', {
                        locale: de,
                    })}
                </div>
            </Button>
        );
    }
);
ConversationPreview.displayName = 'ConversationPreview';
