import * as React from 'react';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { ErrorMessage, SplitViewButton, Toolbar } from '@lotta-schule/hubert';
import { ConversationModel } from 'model';
import { Icon } from 'shared/Icon';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { MessageBubble } from './MessageBubble';

import styles from './MessagesThread.module.scss';

import GetConversationQuery from 'api/query/GetConversationQuery.graphql';

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
        onCompleted: ({ conversation }) => {
          const { cache } = apolloClient;
          let readCount: number;
          cache.modify({
            id: cache.identify(conversation as any),
            fields: {
              unreadMessages: (_ref, _helpers) => {
                readCount = _ref ?? 0;
                return 0;
              },
            },
          });
          cache.modify({
            id: cache.identify(currentUser as any),
            fields: {
              unreadMessages: (ref, _helpers) => {
                return ref - readCount;
              },
            },
          });
        },
      }
    );
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
