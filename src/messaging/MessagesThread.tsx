import * as React from 'react';
import { useQuery } from '@apollo/client';
import { ConversationModel } from 'model';
import { MessageBubble } from './MessageBubble';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { useCurrentUser } from 'util/user/useCurrentUser';

import styles from './MessagesThread.module.scss';

import GetConversationQuery from 'api/query/GetConversationQuery.graphql';

export interface MessagesThreadProps {
    conversation: ConversationModel;
}

export const MessagesThread = React.memo<MessagesThreadProps>(
    ({ conversation }) => {
        const { data, error } = useQuery<{ conversation: ConversationModel }>(
            GetConversationQuery,
            { variables: { id: conversation.id } }
        );
        const messages = Array.from(
            data?.conversation?.messages ?? []
        ).reverse();
        const currentUser = useCurrentUser();

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
            <div
                ref={wrapperRef}
                className={styles.root}
                data-testid={'MessagesThread'}
            >
                <ErrorMessage error={error} />
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        active={currentUser!.id === message.user.id}
                    />
                ))}
            </div>
        );
    }
);
MessagesThread.displayName = 'MessagesThread';
