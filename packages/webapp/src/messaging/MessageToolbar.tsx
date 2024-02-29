import * as React from 'react';
import { Button, SplitViewButton } from '@lotta-schule/hubert';
import { faAdd, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { NewMessageDestination } from 'model';
import { Icon } from 'shared/Icon';
import { CreateMessageDialog } from './CreateMessageDialog';

import styles from './MessageToolbar.module.scss';

export interface MessageToolbarProps {
  onRequestNewMessage(subject: NewMessageDestination): void;
}

export const MessageToolbar = React.memo<MessageToolbarProps>(
  ({ onRequestNewMessage }) => {
    const [isCreateMessageDialogOpen, setIsCreateMessageDialogOpen] =
      React.useState(false);

    return (
      <div className={styles.root}>
        <Button
          className={styles.plusButton}
          icon={<Icon icon={faAdd} size={'lg'} />}
          title={'Neue Nachricht schreiben'}
          onClick={() => setIsCreateMessageDialogOpen(true)}
        ></Button>

        <SplitViewButton
          action={'close'}
          style={{ float: 'right' }}
          aria-label={'Seitenleiste einklappen'}
          icon={<Icon icon={faAngleRight} size={'lg'} />}
        />

        <CreateMessageDialog
          isOpen={isCreateMessageDialogOpen}
          onConfirm={(subject: NewMessageDestination) => {
            onRequestNewMessage(subject);
            setIsCreateMessageDialogOpen(false);
          }}
          onAbort={() => setIsCreateMessageDialogOpen(false)}
        />
      </div>
    );
  }
);
MessageToolbar.displayName = 'MessageToolbar';
