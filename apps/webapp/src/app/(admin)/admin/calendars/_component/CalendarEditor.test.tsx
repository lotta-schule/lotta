import * as React from 'react';
import { render, waitFor } from 'test/util';
import { MockLink } from '@apollo/client/testing';
import { CalendarEditor } from './CalendarEditor';
import { UPDATE_CALENDAR } from '../_graphql';
import userEvent from '@testing-library/user-event';

const additionalMocks = [
  {
    request: {
      query: UPDATE_CALENDAR,
      variables: (_vars) => true,
    },
    result: ({ id, data }) => ({
      data: {
        calendar: {
          __typename: 'Calendar',
          id,
          ...data,
          subscriptionUrl: data.isPubliclyAvailable
            ? 'http://example.com/calendar.ics'
            : '',
        },
      },
    }),
  },
] satisfies MockLink.MockedResponse[];

describe('CalendarEditor', () => {
  it('renders correctly', () => {
    const onClose = vi.fn();
    const screen = render(
      <CalendarEditor
        calendar={{
          id: '1',
          name: 'Work',
          color: '#FF0000',
          isPubliclyAvailable: false,
          subscriptionUrl: null,
        }}
        onClose={onClose}
      />,
      {},
      { additionalMocks }
    );

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Work');
    expect(screen.getByText(/öffentlich zugänglich/)).toBeInTheDocument();
  });

  it('updates calendar and shows subscription URL', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const screen = render(
      <CalendarEditor
        calendar={{
          id: '1',
          name: 'Work',
          color: '#FF0000',
          isPubliclyAvailable: true,
          subscriptionUrl: 'http://example.com/calendar.ics',
        }}
        onClose={onClose}
      />,
      {},
      { additionalMocks }
    );

    await user.click(screen.getByLabelText(/öffentlich zugänglich/));
    await user.click(screen.getByRole('button', { name: /speichern/i }));

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('http://example.com/calendar.ics')
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const screen = render(
      <CalendarEditor
        calendar={{
          id: '1',
          name: 'Work',
          color: '#FF0000',
          isPubliclyAvailable: false,
          subscriptionUrl: null,
        }}
        onClose={onClose}
      />,
      {},
      { additionalMocks }
    );

    await user.click(screen.getByRole('button', { name: /zurück/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('displays an error message if the mutation fails', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: UPDATE_CALENDAR,
          variables: {
            id: '1',
            data: {
              name: 'Work',
              color: '#FF0000',
              isPubliclyAvailable: false,
            },
          },
        },
        result: {
          errors: [{ message: 'An error occurred' }],
        },
      },
    ] satisfies MockLink.MockedResponse[];

    const onClose = vi.fn();
    const screen = render(
      <CalendarEditor
        calendar={{
          id: '1',
          name: 'Work',
          color: '#FF0000',
          isPubliclyAvailable: false,
          subscriptionUrl: null,
        }}
        onClose={onClose}
      />,
      {},
      { additionalMocks: mocks }
    );

    await user.click(screen.getByRole('button', { name: /speichern/i }));

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });

  it('copies the subscription URL to the clipboard', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const writeTextMock = vi.spyOn(navigator.clipboard, 'writeText');

    const screen = render(
      <CalendarEditor
        calendar={{
          id: '1',
          name: 'Work',
          color: '#FF0000',
          isPubliclyAvailable: true,
          subscriptionUrl: 'http://example.com/calendar.ics',
        }}
        onClose={onClose}
      />,
      {},
      { additionalMocks }
    );

    await user.click(screen.getByRole('button', { name: /kopieren/i }));

    expect(writeTextMock).toHaveBeenCalledWith(
      'http://example.com/calendar.ics'
    );
  });
});
