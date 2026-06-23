'use client';

import * as React from 'react';
import { useCurrentUser } from '#/util/user/useCurrentUser';
import { useSubscription } from '@apollo/client/react';
import uniqBy from 'lodash/uniqBy';

import { RECEIVE_MESSAGE_SUBSCRIPTION } from '#/messaging/_graphql/ReceiveMessageSubscription';
import { GET_CONVERSATIONS_QUERY } from '#/messaging/_graphql/GetConversationsQuery';
import { GET_CONVERSATION_QUERY } from '#/messaging/_graphql/GetConversationQuery';
import { LIVE_MESSAGES_FILTER } from '#/messaging/_graphql/fragments';

const Authentication = React.memo(() => {
  const currentUser = useCurrentUser();

  useSubscription(RECEIVE_MESSAGE_SUBSCRIPTION, {
    skip: typeof window === 'undefined' || !currentUser,
    onData: ({ client, data }) => {
      const message = data.data?.message;
      if (message && currentUser && message.user?.id !== currentUser.id) {
        const conversationId = message.conversation.id!;
        const readConversationResult = client.readQuery({
          query: GET_CONVERSATION_QUERY,
          variables: { id: conversationId, filter: LIVE_MESSAGES_FILTER },
        });
        const conversation = {
          ...readConversationResult?.conversation,
          ...message.conversation,
          id: conversationId,
          messages: uniqBy(
            [
              message,
              ...(readConversationResult?.conversation?.messages ?? []),
            ],
            'id'
          ),
        };
        client.writeQuery({
          query: GET_CONVERSATION_QUERY,
          variables: { id: conversationId, filter: LIVE_MESSAGES_FILTER },
          data: { conversation },
        });
        const readConversationsResult = client.readQuery({
          query: GET_CONVERSATIONS_QUERY,
        });
        client.writeQuery({
          query: GET_CONVERSATIONS_QUERY,
          data: {
            conversations: [
              {
                ...conversation,
                unreadMessages:
                  (readConversationsResult?.conversations?.find(
                    (c) => c?.id === conversationId
                  )?.unreadMessages ?? 0) + 1,
              },
              ...(readConversationsResult?.conversations?.filter(
                (c) => c?.id !== conversationId
              ) ?? []),
            ].filter(Boolean),
          },
        });
        client.cache.modify({
          id: client.cache.identify(currentUser as any),
          fields: {
            unreadMessages: (ref, _helpers) => ref + 1,
          },
        });
      }
    },
  });

  return null;
});
Authentication.displayName = 'Authentication';

export default Authentication;
