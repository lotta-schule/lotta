import { getClient } from '#/api/client.js';
import { ConversationModel } from '#/model/index.js';
import { MessagingPage } from '#/messaging/MessagingPage.js';

import GetConversationsQuery from '#/api/query/GetConversationsQuery.graphql';

export default async function MessagingRoute() {
  const client = await getClient();
  const { data } = await client.query<{
    conversations: ConversationModel[];
  }>({
    query: GetConversationsQuery,
  });

  return <MessagingPage conversations={data?.conversations} />;
}
