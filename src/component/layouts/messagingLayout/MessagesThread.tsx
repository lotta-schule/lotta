import * as React from 'react';
import { MessageModel } from 'model';
import { MessageBubble } from './MessageBubble';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { makeStyles } from '@material-ui/core';

export interface MessagesThreadProps {
    messages: MessageModel[];
}

const useStyles = makeStyles(() => ({
    root: {
        overflow: 'auto',
        flexGrow: 1,
        flexShrink: 1,
    },
}));

export const MessagesThread = React.memo<MessagesThreadProps>(
    ({ messages }) => {
        const styles = useStyles();
        const currentUser = useCurrentUser();

        const sortedMessages = messages.sort((message1, message2) => {
            return (
                new Date(message1.insertedAt).getTime() -
                new Date(message2.insertedAt).getTime()
            );
        });

        const wrapperRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
            let n: number | null = null;
            if (wrapperRef.current) {
                n = requestAnimationFrame(() => {
                    if (
                        wrapperRef.current &&
                        wrapperRef.current.clientHeight <
                            wrapperRef.current.scrollHeight
                    ) {
                        wrapperRef.current.scroll?.({
                            behavior: 'smooth',
                            top:
                                wrapperRef.current.scrollHeight -
                                wrapperRef.current.clientHeight,
                        });
                    }
                });
            }
            return () => {
                if (n) {
                    cancelAnimationFrame(n);
                }
            };
        }, [messages]);

        return (
            <div ref={wrapperRef} className={styles.root}>
                {sortedMessages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        active={currentUser!.id === message.senderUser.id}
                    />
                ))}
            </div>
        );
    }
);