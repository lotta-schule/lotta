import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Forum } from '@material-ui/icons';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { ConversationModel, NewMessageDestination } from 'model';
import { useSetWindowHeight } from 'util/useSetWindowHeight';
import { ComposeMessage } from './ComposeMessage';
import { ConversationPreview } from './ConversationPreview';
import { MessagesThread } from './MessagesThread';
import { MessageToolbar } from './MessageToolbar';
import { useIsMobile } from 'util/useIsMobile';
import { Message } from 'util/model/Message';
import { Button } from 'shared/general/button/Button';
import clsx from 'clsx';

import styles from './MessagingView.module.scss';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import { LinearProgress } from 'shared/general/progress/LinearProgress';

export const MessagingView = React.memo(() => {
    const isMobile = useIsMobile();
    const currentUser = useCurrentUser()!;

    const sectionElRef = React.useRef<HTMLElement>(null);
    useSetWindowHeight(sectionElRef);

    const {
        data,
        loading: isLoading,
        error,
    } = useQuery<{ conversations: ConversationModel[] }>(GetConversationsQuery);

    const conversations = data?.conversations ?? [];

    const [selectedConversation, setSelectedConversation] =
        React.useState<ConversationModel | null>(null);
    const [createMessageDestination, setCreateMessageDestination] =
        React.useState<NewMessageDestination | null>(null);

    const [isSidebarActive, setIsSidebarActive] = React.useState(true);

    React.useEffect(() => {
        if (createMessageDestination) {
            setSelectedConversation(null);
            setIsSidebarActive(false);
        }
    }, [createMessageDestination]);

    React.useEffect(() => {
        if (selectedConversation) {
            setCreateMessageDestination(null);
            setIsSidebarActive(false);
        }
    }, [selectedConversation]);

    React.useEffect(() => {
        if (
            isSidebarActive &&
            isMobile &&
            document.activeElement?.nodeName === 'TEXTAREA'
        ) {
            (document.activeElement as HTMLTextAreaElement).blur();
        }
    }, [isSidebarActive, isMobile]);

    if (isLoading) {
        return (
            <LinearProgress
                isIndeterminate
                aria-label={'Unterhaltungen werden geladen'}
            />
        );
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    const isHideSidebarButtonVisible = Boolean(
        selectedConversation || createMessageDestination
    );

    return (
        <section ref={sectionElRef} className={styles.root}>
            <aside
                className={clsx(styles.sideView, {
                    [styles.active]: isSidebarActive,
                })}
            >
                <MessageToolbar
                    onToggle={
                        isHideSidebarButtonVisible
                            ? () => setIsSidebarActive(false)
                            : null
                    }
                    onRequestNewMessage={(destination) => {
                        const conversation = conversations.find((c) => {
                            if (
                                destination.group &&
                                c.groups[0]?.id == destination.group.id
                            ) {
                                return true;
                            }
                            if (
                                destination.user &&
                                c.users.find(
                                    (u) => u.id === destination.user.id
                                )
                            ) {
                                return true;
                            }
                            return false;
                        });
                        if (conversation) {
                            setSelectedConversation(conversation);
                        } else {
                            setCreateMessageDestination(destination);
                        }
                    }}
                />
                {conversations.map((conversation) => (
                    <ConversationPreview
                        key={[...conversation.users, ...conversation.groups]
                            .map(({ id }) => id)
                            .join('-')}
                        conversation={conversation}
                        selected={selectedConversation?.id == conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                    />
                ))}
            </aside>
            <div className={styles.messageView}>
                {isMobile && !isSidebarActive && (
                    <Button
                        icon={<Forum />}
                        style={{ width: 40 }}
                        onClick={() => setIsSidebarActive(true)}
                    />
                )}
                {selectedConversation && (
                    <React.Fragment>
                        {selectedConversation?.messages?.length ? (
                            <MessagesThread
                                conversation={selectedConversation}
                            />
                        ) : (
                            <div className={styles.noMessagesWrapper}>
                                In dieser Unterhaltung wurden noch keine
                                Nachrichten geschrieben.
                            </div>
                        )}
                        <ComposeMessage
                            destination={Message.conversationAsDestination(
                                selectedConversation,
                                currentUser
                            )}
                        />
                    </React.Fragment>
                )}
                {createMessageDestination && (
                    <React.Fragment>
                        {createMessageDestination.user && (
                            <div className={styles.noMessagesWrapper}>
                                Schreibe deine erste Nachricht an{' '}
                                <strong>
                                    {Message.getDestinationName(
                                        createMessageDestination
                                    )}
                                </strong>
                                .
                            </div>
                        )}
                        <ComposeMessage
                            destination={createMessageDestination}
                            onSent={(msg) => {
                                setSelectedConversation(msg.conversation!);
                            }}
                        />
                    </React.Fragment>
                )}
            </div>
        </section>
    );
});
MessagingView.displayName = 'MessagingView';
