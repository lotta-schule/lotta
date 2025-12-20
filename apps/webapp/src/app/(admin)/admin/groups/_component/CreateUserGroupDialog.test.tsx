import { render, waitFor } from 'test/util';
import {
  CREATE_USER_GROUP,
  CreateUserGroupDialog,
} from './CreateUserGroupDialog';
import userEvent from '@testing-library/user-event';
import { MockLink } from '@apollo/client/testing';
import { lehrerGroup } from 'test/fixtures';
import { GET_USER_GROUPS } from '../_graphql';

const userGroupMock = {
  ...lehrerGroup,
  name: 'Test Group',
  id: 'new-test-group-id',
};

const additionalMocks: MockLink.MockedResponse[] = [
  {
    request: {
      query: CREATE_USER_GROUP,
      variables: {
        group: { name: 'Test Group', enrollmentTokens: [] },
      },
    },
    result: {
      data: {
        group: userGroupMock,
      },
    },
  },
  {
    request: {
      query: GET_USER_GROUPS,
    },
    result: {
      data: {
        userGroups: [lehrerGroup],
      },
    },
  },
];

describe('CreateUserGroupDialog', () => {
  it('renders dialog when isOpen is true', async () => {
    const screen = render(
      <CreateUserGroupDialog
        isOpen={true}
        onAbort={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Nutzergruppe erstellen' })
      ).toBeVisible();
    });
  });

  it('calls onAbort when abort button is clicked', async () => {
    const user = userEvent.setup();
    const onAbort = vi.fn();
    const screen = render(
      <CreateUserGroupDialog
        isOpen={true}
        onAbort={onAbort}
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByText('Abbrechen'));
    expect(onAbort).toHaveBeenCalledTimes(1);
  });

  it('calls createUserGroup mutation and onConfirm when form is submitted', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const screen = render(
      <CreateUserGroupDialog
        isOpen={true}
        onAbort={vi.fn()}
        onConfirm={onConfirm}
      />,
      {},
      { additionalMocks }
    );

    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'Test Group');

    await user.click(screen.getByRole('button', { name: /erstellen/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
    expect(onConfirm.mock.calls[0][0]).toHaveProperty(
      'id',
      'new-test-group-id'
    );
  });

  it('disables "Gruppe erstellen" button when name is empty or loading', async () => {
    const user = userEvent.setup();
    const screen = render(
      <CreateUserGroupDialog
        isOpen={true}
        onAbort={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const createButton = screen.getByRole('button', { name: /erstellen/i });
    expect(createButton).toBeDisabled();

    await user.type(screen.getByLabelText(/name/i), 'New Group');
    expect(createButton).toBeEnabled();
  });
});
