import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import {
  SomeUser,
  SomeUserin,
  imageFile as mockImageFile,
} from 'test/fixtures';
import { UserBrowser, UserBrowserProps } from 'shared/browser';
import { ComposeMessage } from './ComposeMessage';
import { MessageModel } from 'model';

import SendMessageMutation from 'api/mutation/SendMessageMutation.graphql';

vi.mock('shared/browser', async (importOriginal) => {
  const originalModule: typeof UserBrowser = await importOriginal();
  return {
    __esModule: true,
    ...originalModule,
    UserBrowser: ({ onSelect }: UserBrowserProps) => {
      React.useEffect(() => {
        onSelect?.([mockImageFile as any]);
      }, [onSelect]);
      return null;
    },
  };
});

describe('shared/layouts/messagingLayout/ComposeMessage', () => {
  it('should render an input box', () => {
    const screen = render(
      <ComposeMessage
        destination={{
          user: SomeUserin,
        }}
      />
    );
    expect(screen.getByRole('textbox')).toBeVisible();
  });

  it('should have a disabled send button when textbox is empty', () => {
    const screen = render(
      <ComposeMessage
        destination={{
          user: SomeUserin,
        }}
      />
    );
    expect(screen.getByRole('button', { name: /senden/ })).toBeDisabled();
  });

  it('should enable the send button when text is entered', async () => {
    const user = userEvent.setup();
    const screen = render(
      <ComposeMessage
        destination={{
          user: SomeUserin,
        }}
      />
    );
    await user.type(screen.getByRole('textbox'), 'Hallo!');
    expect(screen.getByRole('button', { name: /senden/ })).not.toBeDisabled();
  });

  describe('send form', () => {
    it('should send a user a message', async () => {
      const user = userEvent.setup();
      let didCallMutation = false;
      const additionalMocks = [
        {
          request: {
            query: SendMessageMutation,
            variables: {
              message: {
                content: 'Hallo!',
                recipientUser: { id: SomeUserin.id },
                recipientGroup: undefined,
              },
            },
          },
          result: () => {
            didCallMutation = true;
            return {
              data: {
                message: {
                  id: 1,
                  content: 'Hallo!',
                  files: [],
                  user: SomeUser,
                  recipientGroup: null,
                  insertedAt: new Date().toString(),
                  updatedAt: new Date().toString(),
                  conversation: {
                    id: 99900,
                    insertedAt: new Date().toString(),
                    updatedAt: new Date().toString(),
                    users: [SomeUser, SomeUserin],
                    groups: [],
                    messages: [],
                    unreadMessages: 0,
                  },
                },
              },
            };
          },
        },
      ];
      const screen = render(
        <ComposeMessage
          destination={{
            user: SomeUserin,
          }}
        />,
        {},
        { currentUser: SomeUser, additionalMocks }
      );
      await user.type(screen.getByRole('textbox'), 'Hallo!');
      await user.click(screen.getByRole('button', { name: /senden/ }));

      await waitFor(() => {
        expect(didCallMutation).toEqual(true);
      });

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toHaveFocus();
      });
      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('should send a user a file message while keeping typed message', async () => {
      const user = userEvent.setup();
      const additionalMocks = [
        {
          request: {
            query: SendMessageMutation,
            variables: {
              message: {
                content: '',
                files: [{ id: mockImageFile.id }],
                recipientUser: { id: SomeUserin.id },
                recipientGroup: undefined,
              },
            },
          },
          result: vi.fn(() => ({
            data: {
              message: {
                id: 1,
                content: 'Hallo!',
                files: [mockImageFile],
                user: SomeUser,
                recipientGroup: null,
                insertedAt: new Date().toString(),
                updatedAt: new Date().toString(),
                conversation: {
                  id: 99900,
                  insertedAt: new Date().toString(),
                  updatedAt: new Date().toString(),
                  users: [SomeUser, SomeUserin],
                  groups: [],
                  messages: [],
                  unreadMessages: 0,
                },
              },
            },
          })),
        },
      ];
      const screen = render(
        <ComposeMessage
          destination={{
            user: SomeUserin,
          }}
        />,
        {},
        { currentUser: SomeUser, additionalMocks }
      );
      await user.type(screen.getByRole('textbox'), 'Hallo!');
      await user.click(screen.getByRole('button', { name: /datei anhängen/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeVisible();
      });

      expect(
        screen.getByRole('button', { name: /datei auswählen/i })
      ).not.toBeDisabled();
      await user.click(
        screen.getByRole('button', { name: /datei auswählen/i })
      );

      await waitFor(() => {
        expect(additionalMocks[0].result).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toHaveFocus();
      });
      // Text should be kept when the user has sent an image
      expect(screen.getByRole('textbox')).toHaveValue('Hallo!');
    });

    it('should send form on ENTER', async () => {
      const user = userEvent.setup();
      let didCallMutation = false;
      const additionalMocks = [
        {
          request: {
            query: SendMessageMutation,
            variables: {
              message: {
                content: 'Hallo!',
                recipientUser: { id: SomeUserin.id },
                recipientGroup: undefined,
              },
            },
          },
          result: () => {
            didCallMutation = true;
            return {
              data: {
                message: {
                  id: 1,
                  content: 'Hallo!',
                  files: [],
                  user: SomeUser,
                  insertedAt: new Date().toString(),
                  updatedAt: new Date().toString(),
                  conversation: {
                    id: 99901,
                    insertedAt: new Date().toString(),
                    updatedAt: new Date().toString(),
                    users: [SomeUser, SomeUserin],
                    groups: [],
                    messages: [],
                    unreadMessages: 0,
                  },
                },
              },
            };
          },
        },
      ];
      const onSent = vi.fn((message: MessageModel) => {
        expect(message.id).toEqual(1);
      });
      const screen = render(
        <ComposeMessage
          destination={{
            user: SomeUserin,
          }}
          onSent={onSent}
        />,
        {},
        { currentUser: SomeUser, additionalMocks }
      );
      await user.type(screen.getByRole('textbox'), 'Hallo!{enter}');
      await waitFor(() => {
        expect(didCallMutation).toEqual(true);
      });
      expect(onSent).toHaveBeenCalled();
    });

    it('should not send form on ENTER when SHIFT modifier is pressed', async () => {
      const user = userEvent.setup();
      const onSent = vi.fn();
      const screen = render(
        <ComposeMessage
          destination={{
            user: SomeUserin,
          }}
        />,
        {},
        { currentUser: SomeUser }
      );
      await user.type(
        screen.getByRole('textbox'),
        'Hallo!{Shift>}{Enter}{/Shift}Zweite Zeile'
      );
      expect(screen.getByRole('textbox')).toHaveValue('Hallo!\nZweite Zeile');
      expect(onSent).not.toHaveBeenCalled();
    });
  });
});
