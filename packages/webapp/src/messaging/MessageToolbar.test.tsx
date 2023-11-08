import * as React from 'react';
import { render, waitFor } from 'test/util';
import { schuelerGroup, SomeUser } from 'test/fixtures';
import { MessageToolbar } from './MessageToolbar';
import userEvent from '@testing-library/user-event';

describe('src/messaging/MessageToolbar', () => {
  const SomeUserWithGroups = { ...SomeUser, groups: [schuelerGroup] };

  it('should render without error', () => {
    render(
      <MessageToolbar onToggle={() => {}} onRequestNewMessage={() => {}} />,
      {},
      { currentUser: SomeUserWithGroups }
    );
  });

  it('should open the create popup when clicking on the "add" button', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <MessageToolbar onToggle={() => {}} onRequestNewMessage={() => {}} />,
      {},
      { currentUser: SomeUserWithGroups }
    );

    await fireEvent.click(
      screen.getByRole('button', { name: /nachricht schreiben/i })
    );
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /empfänger wählen/i })
      ).toBeVisible();
    });
  });
});