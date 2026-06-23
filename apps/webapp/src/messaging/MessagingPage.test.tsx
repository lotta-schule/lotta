import * as React from 'react';
import { render } from '#/test/util';
import {
  SomeUser,
  SomeUserin,
  createConversation,
  elternGroup,
} from '#/test/fixtures';
import { MessagingPage } from './MessagingPage';

import { GET_CONVERSATIONS_QUERY } from './_graphql/GetConversationsQuery';
import { GET_CONVERSATION_QUERY } from './_graphql/GetConversationQuery';
import { LIVE_MESSAGES_FILTER } from './_graphql/fragments';

describe('pages/messaging', () => {
  const conversations = [
    createConversation(SomeUser, { user: SomeUserin }),
    createConversation(SomeUser, { group: elternGroup }),
  ];

  const additionalMocks = [
    {
      request: { query: GET_CONVERSATIONS_QUERY },
      result: { data: { conversations } },
    },
    ...conversations.map((conversation) => ({
      request: {
        query: GET_CONVERSATION_QUERY,
        variables: { id: conversation.id, filter: LIVE_MESSAGES_FILTER },
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
