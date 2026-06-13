import * as React from 'react';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { ErrorMessage, SplitViewButton, Toolbar } from '@lotta-schule/hubert';
import { ConversationModel } from '#/model/index.js';
import { Icon } from '#/shared/Icon.js';
import { useCurrentUser } from '#/util/user/useCurrentUser.js';
import { MessageBubble } from './MessageBubble.js';

import styles from './MessagesThread.module.scss';

import GetConversationQuery from '#/api/query/GetConversationQuery.graphql';

export interface MessagesThreadProps {
  conversation: ConversationModel;
}

export const MessagesThread = React.memo(
  ({ conversation }: MessagesThreadProps) => {
    const currentUser = useCurrentUser()!;
    const apolloClient = useApolloClient();
    const { data, error } = useQuery<{ conversation: ConversationModel }>(
      GetConversationQuery,
      {
        variables: { id: conversation.id },
        fetchPolicy: 'cache-and-network',
      }
    );

    // Apollo v4 removed `onCompleted` from `useQuery`; mark the conversation read as a
    // side-effect of the data arriving instead.
    const loadedConversation = data?.conversation;
    React.useEffect(() => {
      if (!loadedConversation) {
        return;
      }
      const { cache } = apolloClient;
      let readCount = 0;
      cache.modify({
        id: cache.identify(loadedConversation as any),
        fields: {
          unreadMessages: (ref: any) => {
            readCount = ref ?? 0;
            return 0;
          },
        },
      });
      cache.modify({
        id: cache.identify(currentUser as any),
        fields: {
          unreadMessages: (ref: any) => ref - readCount,
        },
      });
    }, [loadedConversation, apolloClient, currentUser]);
    const messages = Array.from(data?.conversation?.messages ?? []).reverse();

    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
      if (wrapperRef.current) {
        wrapperRef.current.scroll({
          behavior: 'auto',
          top:
            wrapperRef.current.scrollHeight - wrapperRef.current.clientHeight,
        });
      }
    }, []);

    React.useEffect(() => {
      let n: number | null = null;
      if (wrapperRef.current) {
        n = requestAnimationFrame(() => {
          if (
            wrapperRef.current &&
            wrapperRef.current.clientHeight < wrapperRef.current.scrollHeight
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
        <Toolbar hasScrollableParent>
          <SplitViewButton
            action={'open'}
            style={{ width: 40 }}
            icon={<Icon icon={faAngleLeft} />}
          />
        </Toolbar>
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
