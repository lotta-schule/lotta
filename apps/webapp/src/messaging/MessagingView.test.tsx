import * as React from 'react';
import {
  createConversation,
  elternGroup,
  KeinErSieEsUser,
  SomeUser,
  SomeUserin,
} from 'test/fixtures';
import { render, waitFor, userEvent } from 'test/util';
import { MessagingView } from './MessagingView';

import styles from './ConversationPreview.module.scss';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import GetConversationQuery from 'api/query/GetConversationQuery.graphql';
import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';
import SendMessageMutation from 'api/mutation/SendMessageMutation.graphql';

describe('src/messaging/MessagingView', () => {
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
    ...['Lui', 'Michel']
      .map((fullTerm) => {
        return new Array(fullTerm.length)
          .fill(null)
          .map((_, i) => fullTerm.slice(0, i + 1));
      })
      .flat()
      .map((searchtext) => ({
        request: { query: SearchUsersQuery, variables: { searchtext } },
        result: {
          data: {
            users: searchtext.startsWith('L')
              ? [SomeUserin]
              : [KeinErSieEsUser],
          },
        },
      })),
  ];
  it('should list all your conversations', async () => {
    const screen = render(
      <MessagingView />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks,
      }
    );

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', {
          name: /unterhaltung mit/i,
        })
      ).toHaveLength(2);
    });

    expect(
      screen.getByRole('button', { name: /Unterhaltung mit Lui/i })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Unterhaltung mit Eltern/i })
    ).toBeVisible();
  });

  it('should select a conversation', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <MessagingView />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks,
      }
    );

    await fireEvent.click(
      await screen.findByRole('button', { name: /Unterhaltung mit Lui/i })
    );

    expect(screen.getByTestId('MessagesThread')).toBeVisible();
  });

  describe('create new message', () => {
    it('should select an available conversation when chosing the user', async () => {
      const fireEvent = userEvent.setup();

      const screen = render(
        <MessagingView />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks,
        }
      );

      await fireEvent.click(
        await screen.findByRole('button', { name: /neue nachricht/i })
      );

      await fireEvent.type(
        screen.getByRole('combobox', { name: /nutzer suchen/i }),
        'Lui'
      );
      await new Promise((resolve) => setTimeout(resolve, 700)); // wait for animation to finish

      await fireEvent.click(
        await screen.findByRole('option', { name: /Lui/i })
      );

      await waitFor(() => {
        expect(screen.getByTestId('message-destination')).toBeVisible();
      });
      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for animation to finish

      await fireEvent.click(
        screen.getByRole('button', { name: 'Nachricht verfassen' })
      );

      expect(screen.getByTestId('MessagesThread')).toBeVisible();

      const conversationButtons = await screen.findAllByRole('button', {
        name: /unterhaltung mit/i,
      });
      expect(conversationButtons).toHaveLength(2);
      expect(
        screen.getByRole('button', { name: /Unterhaltung mit Lui/ })
      ).toHaveClass(styles.selected);
    });

    it('should show the new message view when selecting a new user', async () => {
      const fireEvent = userEvent.setup();
      const createMsgMock = [
        {
          request: {
            query: SendMessageMutation,
            variables: {
              message: {
                content: 'Hallo!',
                recipientUser: { id: KeinErSieEsUser.id },
                recipientGroup: undefined,
              },
            },
          },
          result: () => {
            return {
              data: {
                message: {
                  id: 99901551,
                  content: 'Hallo!',
                  user: SomeUser,
                  insertedAt: new Date().toString(),
                  updatedAt: new Date().toString(),
                  conversation: {
                    id: 99901,
                    insertedAt: new Date().toString(),
                    updatedAt: new Date().toString(),
                    users: [SomeUser, KeinErSieEsUser],
                    groups: [],
                    messages: [{ id: 99901551 }],
                    unreadMessages: 0,
                  },
                },
              },
            };
          },
        },
      ];

      const screen = render(
        <MessagingView />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: [...additionalMocks, ...createMsgMock],
        }
      );

      await fireEvent.click(
        await screen.findByRole('button', { name: /neue nachricht/i })
      );

      await fireEvent.type(
        screen.getByRole('combobox', { name: /nutzer suchen/i }),
        'Michel'
      );
      await waitFor(() => {
        screen.getByRole('option', { name: /Michel/i });
      });
      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for animation to finish

      await fireEvent.click(
        await screen.findByRole('option', { name: /Michel/i })
      );

      await waitFor(() => {
        expect(screen.getByTestId('message-destination')).toBeVisible();
      });
      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for animation to finish

      await fireEvent.click(
        screen.getByRole('button', { name: 'Nachricht verfassen' })
      );

      expect(screen.queryByTestId('MessagesThread')).toBeNull();

      const conversationButtons = await screen.findAllByRole('button', {
        name: /unterhaltung mit/i,
      });
      expect(conversationButtons).toHaveLength(2);

      expect(
        screen.getByText(/schreibe deine erste nachricht an/i)
      ).toBeVisible();

      expect(screen.getByText('Mich')).toBeVisible();
    });
  });
});
