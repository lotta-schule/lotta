import * as React from 'react';
import { render, fireEvent, waitFor } from 'test/util';
import { MockLink } from '@apollo/client/testing';
import { CreateCalendarDialog } from './CreateCalendarDialog';
import { CREATE_CALENDAR, GET_CALENDARS } from '../_graphql';
import userEvent from '@testing-library/user-event';

const additionalMocks = [
  {
    request: {
      query: GET_CALENDARS,
    },
    result: {
      data: {
        calendars: {
          __typename: 'Calendar',
          id: '1',
          name: 'Calendar',
          color: '#ff0000',
          isPubliclyAvailable: false,
          subscriptionUrl: '',
        },
      },
    },
  },
  {
    request: {
      query: CREATE_CALENDAR,
      variables: {
        data: {
          name: 'New Calendar',
          color: '#ff0000',
        },
      },
    },
    result: {
      data: {
        calendar: {
          __typename: 'Calendar',
          id: '1',
          name: 'New Calendar',
          color: '#ff0000',
          isPubliclyAvailable: false,
          subscriptionUrl: '',
        },
      },
    },
  },
] satisfies MockLink.MockedResponse[];

describe('CreateCalendarDialog', () => {
  it('renders correctly when open', () => {
    const onClose = vi.fn();
    const screen = render(
      <CreateCalendarDialog isOpen onClose={onClose} />,
      {},
      { additionalMocks }
    );

    expect(
      screen.getByRole('dialog', { name: /kalender erstellen/i })
    ).toBeInTheDocument();
  });

  it('calls createCalendar mutation on form submit', async () => {
    const user = userEvent.setup();

    const onClose = vi.fn();
    const screen = render(
      <CreateCalendarDialog isOpen={true} onClose={onClose} />,
      {},
      { additionalMocks }
    );

    await userEvent.type(
      screen.getByRole('textbox', { name: /Name/i }),
      'New Calendar'
    );
    await user.click(screen.getByRole('button', { name: /erstellen/i }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays an error message if the mutation fails', async () => {
    const mocks = [
      {
        request: {
          query: CREATE_CALENDAR,
          variables: {
            data: {
              name: 'New Calendar',
              color: '#ff0000',
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
      <CreateCalendarDialog isOpen onClose={onClose} />,
      {},
      {
        additionalMocks: mocks,
      }
    );

    fireEvent.change(screen.getByRole('textbox', { name: /Name/i }), {
      target: { value: 'New Calendar' },
    });
    fireEvent.click(screen.getByRole('button', { name: /erstellen/i }));

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });

  it('calls onClose when "Abbrechen" button is clicked', () => {
    const onClose = vi.fn();
    const screen = render(<CreateCalendarDialog isOpen onClose={onClose} />);

    fireEvent.click(screen.getByText('Abbrechen'));

    expect(onClose).toHaveBeenCalled();
  });
});
