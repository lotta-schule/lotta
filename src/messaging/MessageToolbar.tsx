import * as React from 'react';
import { Button } from '@lotta-schule/hubert';
import { faAdd, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { NewMessageDestination } from 'model';
import { Icon } from 'shared/Icon';
import { useIsMobile } from 'util/useIsMobile';
import { CreateMessageDialog } from './CreateMessageDialog';

import styles from './MessageToolbar.module.scss';

export interface MessageToolbarProps {
    onRequestNewMessage(subject: NewMessageDestination): void;
    onToggle: null | (() => void);
}

export const MessageToolbar = React.memo<MessageToolbarProps>(
    ({ onToggle, onRequestNewMessage }) => {
        const isMobile = useIsMobile();

        const [isCreateMessageDialogOpen, setIsCreateMessageDialogOpen] =
            React.useState(false);

        return (
            <div className={styles.root}>
                <Button
                    icon={<Icon icon={faAdd} size={'lg'} />}
                    title={'Neue Nachricht schreiben'}
                    onClick={() => setIsCreateMessageDialogOpen(true)}
                ></Button>
                {isMobile && onToggle && (
                    <Button
                        style={{ float: 'right' }}
                        aria-label={'Seitenleiste einklappen'}
                        onClick={onToggle}
                        icon={<Icon icon={faArrowLeft} size={'lg'} />}
                    />
                )}
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
