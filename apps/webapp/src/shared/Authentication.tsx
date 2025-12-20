'use client';
import * as React from 'react';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ConversationModel, ID, MessageModel } from 'model';
import { useSubscription } from '@apollo/client/react';
import pick from 'lodash/pick';

import ReceiveMessageSubscription from 'api/subscription/ReceiveMessageSubscription.graphql';
import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import GetConversationQuery from 'api/query/GetConversationQuery.graphql';

const Authentication = React.memo(() => {
  const currentUser = useCurrentUser();

  useSubscription<{ message: MessageModel }>(ReceiveMessageSubscription, {
    skip: typeof window === 'undefined' || !currentUser,
    onData: ({ client, data }) => {
      const message = data.data?.message;
      if (message && currentUser && message.user.id !== currentUser.id) {
        const readConversationResult = client.readQuery<
          { conversation: ConversationModel },
          { id: ID }
        >({
          query: GetConversationQuery,
          variables: { id: message.conversation!.id },
        });
        const conversation = {
          ...readConversationResult?.conversation,
          ...message.conversation,
          messages: [
            message,
            ...(readConversationResult?.conversation.messages ?? []),
          ],
        };
        client.writeQuery({
          query: GetConversationQuery,
          variables: { id: conversation.id },
          data: { conversation },
        });
        const readConversationsResult = client.readQuery<{
          conversations: ConversationModel[];
        }>({ query: GetConversationsQuery });
        client.writeQuery({
          query: GetConversationsQuery,
          data: {
            conversations: [
              {
                ...conversation,
                unreadMessages:
                  (readConversationsResult?.conversations?.find(
                    (c) => c.id === message.conversation!.id
                  )?.unreadMessages ?? 0) + 1,
                messages: conversation.messages.map((c) =>
                  pick(c, ['id', '__typename'])
                ),
              },
              ...(readConversationsResult?.conversations?.filter(
                (c) => c.id !== conversation.id
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
