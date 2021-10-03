import * as React from 'react';
import { LinearProgress } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ChatType, ThreadRepresentation } from 'model';
import { MessagesThread } from './MessagesThread';
import { useSetWindowHeight } from 'util/useSetWindowHeight';
import { ComposeMessage } from './ComposeMessage';
import { ThreadPreview } from './ThreadPreview';
import { MessageToolbar } from './MessageToolbar';
import { Forum } from '@material-ui/icons';
import { useIsMobile } from 'util/useIsMobile';
import { useMessages } from './useMessages';
import { Button } from 'component/general/button/Button';
import clsx from 'clsx';

import styles from './MessagingView.module.scss';

export const MessagingView = React.memo(() => {
    const isMobile = useIsMobile();
    const currentUser = useCurrentUser();

    const sectionElRef = React.useRef<HTMLElement>(null);
    useSetWindowHeight(sectionElRef);

    const { data, loading: isLoading, error } = useMessages();

    const [selectedThread, setSelectedThread] =
        React.useState<ThreadRepresentation | null>(null);
    const [newMessageThread, setNewMessageThread] =
        React.useState<ThreadRepresentation | null>(null);

    const [isSidebarActive, setIsSidebarActive] = React.useState(true);

    const threadRepresentations = React.useMemo(() => {
        return Array.from(data?.messages ?? [])
            .sort((msg1, msg2) => msg2.updatedAt.localeCompare(msg1.updatedAt))
            .reduce(
                (reps, message) => {
                    const representation: ThreadRepresentation & {
                        date: Date;
                    } = {
                        messageType: message.recipientUser
                            ? ChatType.DirectMessage
                            : ChatType.GroupChat,
                        counterpart: message.recipientGroup
                            ? message.recipientGroup
                            : message.senderUser.id !== currentUser!.id
                            ? message.senderUser
                            : message.recipientUser,
                        date: new Date(message.updatedAt),
                    };
                    if (
                        !representation.counterpart ||
                        reps.find(
                            ({ messageType, counterpart }) =>
                                messageType === representation.messageType &&
                                counterpart?.id ===
                                    representation.counterpart?.id
                        )
                    ) {
                        return reps;
                    } else {
                        return [...reps, representation];
                    }
                },
                [
                    ...(newMessageThread ? [newMessageThread] : []),
                ] as (ThreadRepresentation & { date: Date })[]
            );
    }, [data, currentUser, newMessageThread]);

    const getMessagesForThread = React.useCallback(
        (thread: ThreadRepresentation) => {
            return (
                data?.messages.filter((msg) =>
                    thread.messageType === ChatType.DirectMessage
                        ? msg.recipientUser?.id === thread.counterpart.id ||
                          (msg.senderUser.id === thread.counterpart.id &&
                              !msg.recipientGroup)
                        : msg.recipientGroup?.id === thread.counterpart.id
                ) ?? []
            );
        },
        [data]
    );

    React.useEffect(() => {
        if (!selectedThread && threadRepresentations.length) {
            setSelectedThread(threadRepresentations[0]);
        }
    }, [selectedThread, threadRepresentations]);

    React.useEffect(() => {
        if (newMessageThread && newMessageThread !== selectedThread) {
            setNewMessageThread(null);
        }
    }, [selectedThread, newMessageThread]);

    React.useEffect(() => {
        if (selectedThread) {
            setIsSidebarActive(false);
        }
    }, [selectedThread]);

    const mainView = React.useMemo(() => {
        if (!selectedThread) {
            return null;
        }
        const messages = getMessagesForThread(selectedThread);
        const messagesView = messages?.length ? (
            <MessagesThread messages={messages} />
        ) : (
            <div className={styles.noMessagesWrapper}>
                Du hast noch keine Nachrichten mit{' '}
                {selectedThread.counterpart.name} ausgetauscht.
            </div>
        );
        return (
            <>
                {messagesView}
                <ComposeMessage threadRepresentation={selectedThread} />
            </>
        );
    }, [getMessagesForThread, selectedThread]);

    if (isLoading) {
        return <LinearProgress />;
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    return (
        <section ref={sectionElRef} className={styles.root}>
            <aside
                className={clsx(styles.sideView, {
                    [styles.active]: isSidebarActive,
                })}
            >
                <MessageToolbar
                    onToggle={() => setIsSidebarActive(false)}
                    onCreateMessageThread={(newMsgThread) => {
                        setNewMessageThread(newMsgThread);
                        setSelectedThread(newMsgThread);
                    }}
                />
                {threadRepresentations.map((thread) => (
                    <ThreadPreview
                        key={thread.messageType + thread.counterpart.id}
                        selected={Boolean(
                            selectedThread &&
                                selectedThread.messageType ===
                                    thread.messageType &&
                                selectedThread.counterpart.id ===
                                    thread.counterpart.id
                        )}
                        counterpart={thread.counterpart}
                        date={thread.date}
                        onClick={() => setSelectedThread(thread)}
                    />
                ))}
            </aside>
            <div className={styles.messageView}>
                {isMobile && (
                    <Button
                        icon={<Forum />}
                        style={{ width: 40 }}
                        onClick={() => setIsSidebarActive(true)}
                    />
                )}
                {mainView}
            </div>
        </section>
    );
});
MessagingView.displayName = 'MessagingView';
