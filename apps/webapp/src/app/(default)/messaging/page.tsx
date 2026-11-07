import { unauthorized } from 'next/navigation.js';
import { getClient } from '#/api/client';
import { loadCurrentUser } from '#/loader/loadCurrentUser';
import { MessagingPage } from '#/messaging/MessagingPage';

import { GET_CONVERSATIONS_QUERY } from '#/messaging/_graphql/GetConversationsQuery';

export default async function MessagingRoute() {
  const user = await loadCurrentUser();

  if (!user) {
    unauthorized();
  }

  const client = await getClient();
  const { data } = await client.query({
    query: GET_CONVERSATIONS_QUERY,
  });

  const conversations = data?.conversations?.filter(
    (c): c is NonNullable<typeof c> => c != null
  );

  return <MessagingPage conversations={conversations} />;
}
