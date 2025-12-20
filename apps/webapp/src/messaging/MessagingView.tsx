import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import {
  SplitView,
  SplitViewContent,
  SplitViewNavigation,
  useIsMobile,
} from '@lotta-schule/hubert';
import { ErrorMessage, LinearProgress } from '@lotta-schule/hubert';
import { ConversationModel, MessageModel, NewMessageDestination } from 'model';
import { ComposeMessage } from './ComposeMessage';
import { ConversationPreview } from './ConversationPreview';
import { MessagesThread } from './MessagesThread';
import { MessageToolbar } from './MessageToolbar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Message } from 'util/model/Message';

import styles from './MessagingView.module.scss';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';

export const MessagingView = React.memo(() => {
  const isMobile = useIsMobile();
  const currentUser = useCurrentUser()!;

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

  const onMessageSent = React.useCallback((msg: MessageModel) => {
    if (msg.conversation) {
      setSelectedConversation(msg.conversation);
    }
  }, []);

  React.useEffect(() => {
    if (createMessageDestination) {
      setSelectedConversation(null);
    }
  }, [createMessageDestination]);

  React.useEffect(() => {
    if (selectedConversation) {
      setCreateMessageDestination(null);
    }
  }, [selectedConversation]);

  React.useEffect(() => {
    if (isMobile && document.activeElement?.nodeName === 'TEXTAREA') {
      (document.activeElement as HTMLTextAreaElement).blur();
    }
  }, [isMobile]);

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

  return (
    <SplitView
      className={styles.root}
      closeCondition={() => selectedConversation !== null}
    >
      {({ close: closeSidebar }) => (
        <>
          <SplitViewNavigation className={styles.splitViewNavigation}>
            <MessageToolbar
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
                    c.users.find((u) => u.id === destination.user.id)
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
                closeSidebar({ force: true });
              }}
            />

            {conversations.map((conversation) => (
              <ConversationPreview
                className={styles.conversationPreview}
                key={[...conversation.users, ...conversation.groups]
                  .map(({ id }) => id)
                  .join('-')}
                conversation={conversation}
                selected={selectedConversation?.id == conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  closeSidebar({ force: true });
                }}
              />
            ))}
          </SplitViewNavigation>
          <SplitViewContent>
            {selectedConversation && (
              <>
                {selectedConversation?.messages?.length ? (
                  <MessagesThread
                    conversation={selectedConversation}
                    key={selectedConversation.id}
                  />
                ) : (
                  <div className={styles.noMessagesWrapper}>
                    In dieser Unterhaltung wurden noch keine Nachrichten
                    geschrieben.
                  </div>
                )}
              </>
            )}
            {createMessageDestination?.user && (
              <div className={styles.noMessagesWrapper}>
                Schreibe deine erste Nachricht an{' '}
                <strong>
                  {Message.getDestinationName(createMessageDestination)}
                </strong>
                .
              </div>
            )}
            {(selectedConversation || createMessageDestination) && (
              <ComposeMessage
                destination={
                  createMessageDestination
                    ? createMessageDestination
                    : Message.conversationAsDestination(
                        selectedConversation!,
                        currentUser
                      )
                }
                onSent={onMessageSent}
              />
            )}
          </SplitViewContent>
        </>
      )}
    </SplitView>
  );
});
MessagingView.displayName = 'MessagingView';
