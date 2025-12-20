import * as React from 'react';
import { render, waitFor } from 'test/util';
import { MockLink } from '@apollo/client/testing';
import { ManageCalendarsDialog } from './ManageCalendarsDialog';
import { GET_CALENDARS } from '../_graphql';
import userEvent from '@testing-library/user-event';

const additionalMocks = [
  {
    request: {
      query: GET_CALENDARS,
    },
    result: {
      data: {
        calendars: [
          {
            __typename: 'Calendar',
            id: '1',
            name: 'Work',
            color: '#FF0000',
            isPubliclyAvailable: false,
            subscriptionUrl: '',
          },
          {
            __typename: 'Calendar',
            id: '2',
            name: 'Personal',
            color: '#00FF00',
            isPubliclyAvailable: false,
            subscriptionUrl: '',
          },
        ],
      },
    },
  },
] satisfies MockLink.MockedResponse[];

describe('ManageCalendarsDialog', () => {
  it('renders calendars correctly', async () => {
    const onClose = vi.fn();
    const screen = render(
      <ManageCalendarsDialog isOpen={true} onClose={onClose} />,
      {},
      { additionalMocks }
    );

    expect(await screen.findAllByRole('listitem')).toHaveLength(2);

    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('shows "no calendars found" when there are no calendars', async () => {
    const emptyMocks = [
      {
        request: {
          query: GET_CALENDARS,
        },
        result: {
          data: {
            calendars: [],
          },
        },
      },
    ] satisfies MockLink.MockedResponse[];

    const onClose = vi.fn();
    const screen = render(
      <ManageCalendarsDialog isOpen onClose={onClose} />,
      {},
      { additionalMocks: emptyMocks }
    );

    await waitFor(() => {
      expect(screen.getByText(/keine kalender gefunden/i)).toBeVisible();
    });
  });

  it('opens the CreateCalendarDialog when "create calendar" button is clicked', async () => {
    const user = userEvent.setup();

    const onClose = vi.fn();
    const screen = render(
      <ManageCalendarsDialog isOpen onClose={onClose} />,
      {},
      { additionalMocks }
    );

    await user.click(screen.getByRole('button', { name: /erstellen/ }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /erstellen/ })).toBeVisible();
    });
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const screen = render(
      <ManageCalendarsDialog isOpen onClose={onClose} />,
      {},
      { additionalMocks }
    );

    await user.click(screen.getByText('abbrechen'));

    expect(onClose).toHaveBeenCalled();
  });
});
