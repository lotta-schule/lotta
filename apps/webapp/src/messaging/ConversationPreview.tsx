import * as React from 'react';
import { Badge, Button } from '@lotta-schule/hubert';
import { ConversationModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { User } from 'util/model';
import { format } from 'date-fns';
import { Message } from 'util/model/Message';
import { de } from 'date-fns/locale';
import clsx from 'clsx';

import styles from './ConversationPreview.module.scss';

export interface ConversationPreviewProps {
  conversation: ConversationModel;
  selected?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ConversationPreview = React.memo(
  ({
    conversation,
    selected,
    className,
    onClick,
  }: ConversationPreviewProps) => {
    const currentUser = useCurrentUser()!;

    const user = React.useMemo(
      () => conversation.users.find((u) => u.id !== currentUser?.id) ?? null,
      [conversation, currentUser]
    );
    const group = conversation.groups[0] ?? null;

    if (!currentUser) {
      return null;
    }

    return (
      <Button
        onClick={onClick}
        className={clsx(styles.root, className, {
          [styles.selected]: selected,
        })}
        aria-label={`Unterhaltung mit ${Message.getDestinationName(
          Message.conversationAsDestination(conversation, currentUser)
        )}`}
      >
        {user && (
          <UserAvatar user={user} size={50} className={styles.userAvatar} />
        )}
        <div className={styles.buttonLabel}>
          <strong>
            {user && User.getName(user)}
            {group?.name}
          </strong>
          <Badge value={conversation.unreadMessages} />
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
