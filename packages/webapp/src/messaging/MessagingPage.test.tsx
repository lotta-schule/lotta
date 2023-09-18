import * as React from 'react';
import { render } from 'test/util';
import {
  SomeUser,
  SomeUserin,
  createConversation,
  elternGroup,
} from 'test/fixtures';
import { MessagingPage } from './MessagingPage';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import GetConversationQuery from 'api/query/GetConversationQuery.graphql';

describe('pages/messaging', () => {
  const conversations = [
    createConversation(SomeUser, { user: SomeUserin }),
    createConversation(SomeUser, { group: elternGroup }),
  ];

  const additionalMocks = [
    {
      request: { query: GetConversationsQuery },
      result: { data: { conversations } },
    },
    ...conversations.map((conversation) => ({
      request: {
        query: GetConversationQuery,
        variables: { id: conversation.id },
      },
      result: { data: { conversation } },
    })),
  ];

  it('should show the page with title when user is logged in', async () => {
    const screen = render(
      <MessagingPage />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks,
      }
    );
    expect(screen.getByTestId('title')).toBeVisible();
  });
});
