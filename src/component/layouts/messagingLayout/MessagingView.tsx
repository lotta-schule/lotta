import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, LinearProgress, makeStyles, Typography } from '@material-ui/core';
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
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        padding: theme.spacing(1, 0),
        width: '100%',
    },
    sideView: {
        position: 'relative',
        flex: '0 0 20em',
        overflow: 'auto',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
            '&.active': {
                display: 'block',
                marginRight: theme.spacing(1)
            }
        }
    },
    messageView: {
        marginLeft: theme.spacing(2),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        flex: '1 2 100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0
        }
    },
    noMessagesWrapper: {
        display: 'flex',
        flexGrow: 1,
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.text.disabled
    }
}));

export const MessagingView = memo(() => {
    const styles = useStyles();
    const isMobile = useIsMobile();
    const currentUser = useCurrentUser();

    const sectionElRef = useRef<HTMLElement>(null);
    useSetWindowHeight(sectionElRef);

    const { data, loading: isLoading, error } = useMessages();

    const [selectedThread, setSelectedThread] = useState<ThreadRepresentation | null>(null);
    const [newMessageThread, setNewMessageThread] = useState<ThreadRepresentation | null>(null);

    const [isSidebarActive, setIsSidebarActive] = useState(true);

    const threadRepresentations = useMemo(() => {
        return Array.from(data?.messages ?? [])
            .sort((msg1, msg2) => msg2.updatedAt.localeCompare(msg1.updatedAt))
            .reduce((reps, message) => {
                const representation: ThreadRepresentation & { date: Date } = {
                    messageType: message.recipientUser ? ChatType.DirectMessage : ChatType.GroupChat,
                    counterpart: message.recipientGroup ?
                        message.recipientGroup :
                        message.senderUser.id !== currentUser!.id ? message.senderUser : message.recipientUser,
                    date: new Date(message.updatedAt)
                };
                if (!representation.counterpart || reps.find(({ messageType, counterpart }) => messageType === representation.messageType && counterpart?.id === representation.counterpart?.id)) {
                    return reps;
                } else {
                    return [...reps, representation];
                }
            }, [...(newMessageThread ? [newMessageThread] : [])] as (ThreadRepresentation & { date: Date })[]);
    }, [data, currentUser, newMessageThread]);

    const getMessagesForThread = useCallback((thread: ThreadRepresentation) => {
        return data?.messages.filter(msg =>
            (thread.messageType === ChatType.DirectMessage) ?
            msg.recipientUser?.id === thread.counterpart.id || ((msg.senderUser.id === thread.counterpart.id) && !msg.recipientGroup) :
            msg.recipientGroup?.id === thread.counterpart.id
        ) ?? [];
    }, [data]);

    useEffect(() => {
        if (!selectedThread && threadRepresentations.length) {
            setSelectedThread(threadRepresentations[0]);
        }
    }, [selectedThread, threadRepresentations]);

    useEffect(() => {
        if (newMessageThread && newMessageThread !== selectedThread) {
            setNewMessageThread(null);
        }
    }, [selectedThread, newMessageThread]);

    useEffect(() => { if (selectedThread) { setIsSidebarActive(false); } }, [selectedThread]);

    const mainView = useMemo(() => {
        if (!selectedThread) {
            return (
                null
            );
        }
        const messages = getMessagesForThread(selectedThread);
        const messagesView = messages?.length ?
            <MessagesThread messages={messages} /> : (
                <div className={styles.noMessagesWrapper}>
                    <Typography variant={'body2'}>
                        Du hast noch keine Nachrichten mit {selectedThread.counterpart.name} ausgetauscht.
                    </Typography>
                </div>
            );
        return (
            <>
                {messagesView}
                <ComposeMessage threadRepresentation={selectedThread} />
            </>
        );
    }, [getMessagesForThread, selectedThread, styles.noMessagesWrapper]);

    if (isLoading) {
        return (
            <LinearProgress />
        );
    }

    if (error) {
        return (
            <ErrorMessage error={error} />
        );
    }

    return (
        <section ref={sectionElRef} className={styles.root}>
            <aside className={clsx(styles.sideView, { active: isSidebarActive })}>
                <MessageToolbar
                    onToggle={() => setIsSidebarActive(false)}
                    onCreateMessageThread={newMsgThread => {
                        setNewMessageThread(newMsgThread);
                        setSelectedThread(newMsgThread);
                    }}
                />
                {threadRepresentations.map(thread => (
                    <ThreadPreview
                        key={thread.messageType + thread.counterpart.id}
                        selected={Boolean(
                            selectedThread &&
                            selectedThread.messageType === thread.messageType &&
                            selectedThread.counterpart.id === thread.counterpart.id
                        )}
                        counterpart={thread.counterpart}
                        date={thread.date}
                        onClick={() => setSelectedThread(thread)}
                    />
                ))}
            </aside>
            <div className={styles.messageView}>
                {isMobile && (
                    <IconButton style={{ width: 40 }} onClick={() => setIsSidebarActive(true)}>
                        <Forum />
                    </IconButton>
                )}
                {mainView}
            </div>
        </section>
    );
});
