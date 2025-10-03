import { getClient } from 'api/client';
import { ConversationModel } from 'model';
import { MessagingPage } from 'messaging/MessagingPage';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';

export default async function MessagingRoute() {
  const client = await getClient();
  const { data } = await client.query<{
    conversations: ConversationModel[];
  }>({
    query: GetConversationsQuery,
  });

  return <MessagingPage conversations={data?.conversations} />;
}
