import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import {
  SomeUser,
  SomeUserin,
  createConversation,
  imageFile,
  documentFile,
} from 'test/fixtures';
import { FileModel } from 'model';
import { MessageBubble } from './MessageBubble';

import DeleteMessageMutation from 'api/mutation/DeleteMessageMutation.graphql';

const message = {
  ...createConversation(SomeUser, { user: SomeUserin }).messages[0],
  content: 'Hallo!',
};

describe('messaging/MessageBubble', () => {
  it('should render the shared', () => {
    const screen = render(<MessageBubble message={message} />);

    expect(screen.getByText('Hallo!')).toBeVisible();
  });

  it('should render show the message and sender name', () => {
    const screen = render(<MessageBubble message={message} />);
    expect(screen.getByText('Hallo!')).toBeVisible();
    expect(screen.getByText(/Che \(Ernesto Guevara\)/)).toBeVisible();
  });

  describe('attached files', () => {
    it('should not show the files section if no file is given', () => {
      const screen = render(<MessageBubble message={message} />);
      expect(screen.queryByTestId('message-attachments')).toBeNull();
    });

    it('should show download button and image preview if file is given', () => {
      const messageWithFiles = {
        ...message,
        files: [imageFile, documentFile] as any as FileModel[],
      };
      const screen = render(<MessageBubble message={messageWithFiles} />);
      expect(screen.getByTestId('message-attachments')).toBeVisible();

      expect(screen.getAllByRole('link', { name: /download/ })).toHaveLength(2);
    });
  });

  describe('delete button', () => {
    it('should show delete button for own messages', async () => {
      const screen = render(
        <MessageBubble message={message} active />,
        {},
        { currentUser: SomeUser }
      );
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /löschen/ })).toBeVisible();
      });
    });

    it("should not show delete button for other people's messages", () => {
      const screen = render(
        <MessageBubble message={message} />,
        {},
        { currentUser: SomeUserin }
      );
      expect(screen.queryByRole('button', { name: /löschen/ })).toBeNull();
    });
  });

  it('should send a message delete request', async () => {
    const fireEvent = userEvent.setup();
    const resultFn = vi.fn(() => ({ data: { message: message } }));
    const screen = render(
      <MessageBubble message={message} active />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: DeleteMessageMutation,
              variables: { id: message.id },
            },
            result: resultFn,
          },
        ],
      }
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /löschen/ })).not.toBeNull();
    });
    await fireEvent.click(screen.getByRole('button', { name: /löschen/ }));
    await waitFor(() => {
      expect(resultFn).toHaveBeenCalled();
    });
  });
});
